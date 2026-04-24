const prisma = require('../lib/prisma');

// @desc    Global search books
// @route   GET /api/books/search
exports.searchBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const books = await prisma.book.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { author: { contains: q, mode: 'insensitive' } },
                    { tags: { hasSome: [q] } }, // for exact tag match or use mapped contains if tags are strings
                ],
            },
            take: 10, // Limit results for search dropdown
            select: {
                id: true,
                title: true,
                author: true,
                cover_url: true,
                price: true,
                category: true
            }
        });

        res.json(books);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};

// @desc    Get all books with filtering and search
// @route   GET /api/books
exports.getBooks = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
            ];
        }

        const books = await prisma.book.findMany({
            where: query,
            orderBy: { createdAt: 'desc' },
        });

        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
exports.getBookById = async (req, res) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a book (Admin only)
// @route   POST /api/books
exports.createBook = async (req, res) => {
    try {
        const { title, description, author, price, preview_pdf_url, full_pdf_url, category, tags, cover_url } = req.body;

        const book = await prisma.book.create({
            data: {
                title,
                description,
                author,
                price: parseFloat(price),
                preview_pdf_url,
                full_pdf_url,
                category,
                tags,
                cover_url
            },
        });
        res.status(201).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a book
// @route   PUT /api/books/:id
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Ensure price is float if present
        if (data.price) data.price = parseFloat(data.price);

        const book = await prisma.book.update({
            where: { id: parseInt(id) },
            data: data
        });
        res.json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.book.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Book deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Delete failed' });
    }
};
