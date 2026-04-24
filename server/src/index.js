const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Test Route
app.get('/', (req, res) => {
    res.send('READSTACK API is running...');
});

// Routes Placeholder
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/external-books', require('./routes/externalBooks'));

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is healthy' });
});

// TEMPORARY SEED ROUTE (Delete after use)
// TEMPORARY SEED ROUTE (Delete after use)
app.get('/api/seed-database', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const axios = require('axios');
        const prisma = require('./lib/prisma');
        
        // 1. CLEAR ALL EXISTING BOOKS (Hard Reset)
        await prisma.book.deleteMany({});
        
        const genres = [
            'Art', 'Mystery', 'Sci-Fi', 'Technology', 'Business', 
            'Finance', 'Self-Help', 'Fiction', 'History', 'Romance',
            'Fantasy', 'Philosophy', 'Science', 'Travel', 'Biography'
        ];

        let totalSeeded = 0;

        for (const genre of genres) {
            try {
                // Map UI names to Open Library search terms if needed
                const searchTerm = genre === 'Sci-Fi' ? 'Science Fiction' : genre;
                const response = await axios.get(`https://openlibrary.org/search.json?q=subject:${searchTerm}&limit=40`);
                const docs = response.data.docs;

                const booksToInsert = docs
                    .filter(doc => doc.title && doc.author_name && doc.cover_i)
                    .map(doc => ({
                        title: doc.title,
                        author: doc.author_name[0],
                        description: doc.first_sentence ? doc.first_sentence[0] : `An engaging exploration of ${genre} from the global literary archives.`,
                        price: Math.floor(Math.random() * (45 - 15 + 1) + 15) + 0.99, // Random price between 15-45
                        category: genre,
                        cover_url: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                    }));

                for (const book of booksToInsert) {
                    await prisma.book.upsert({
                        where: { book_title_author: { title: book.title, author: book.author } },
                        update: {},
                        create: book
                    });
                    totalSeeded++;
                }
            } catch (err) {
                console.error(`Error seeding ${genre}:`, err.message);
            }
        }
        
        res.json({ 
            success: true, 
            message: `Master Seed Complete! Successfully seeded ${totalSeeded} books across ${genres.length} genres.`,
            genres: genres
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
