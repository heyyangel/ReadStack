const axios = require('axios');
const prisma = require('../src/lib/prisma');

async function importBooks() {
    console.log('🚀 Starting Smart Book Import (PDF focus)...');

    try {
        // 1. Clear existing data in order of dependency
        console.log('🧹 Clearing existing data (Orders, Favorites, Progress, Books)...');
        await prisma.order.deleteMany({});
        await prisma.favorite.deleteMany({});
        await prisma.readingProgress.deleteMany({});
        await prisma.book.deleteMany({});
        console.log('✨ Database cleared.');

        let importedCount = 0;
        let nextPageUrl = 'https://gutendex.com/books?mime_type=application/pdf&languages=en';

        console.log('📚 Searching for books with functional PDFs...');

        while (importedCount < 32 && nextPageUrl) {
            console.log(`🌐 Fetching from: ${nextPageUrl}`);
            const response = await axios.get(nextPageUrl);
            const gutData = response.data;
            const gutBooks = gutData.results;
            nextPageUrl = gutData.next;

            if (!gutBooks || gutBooks.length === 0) break;

            for (const gutBook of gutBooks) {
                if (importedCount >= 32) break;

                // Safely get the PDF URL from the formats object
                const pdfUrl = gutBook.formats['application/pdf'];
                
                if (!pdfUrl) {
                    console.log(`⏩ Skipping "${gutBook.title}" (Strict PDF check failed)`);
                    continue;
                }

                console.log(`🔎 Processing: ${gutBook.title}...`);

                // 2. Fetch Cover from Open Library
                let coverUrl = 'https://images.unsplash.com/photo-1543005127-d020d536780c?q=80&w=1000&auto=format&fit=crop'; // Default
                try {
                    const olResponse = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(gutBook.title)}&limit=1`);
                    const olData = olResponse.data;
                    if (olData.docs && olData.docs.length > 0 && olData.docs[0].cover_i) {
                        coverUrl = `https://covers.openlibrary.org/b/id/${olData.docs[0].cover_i}-L.jpg`;
                    }
                } catch (coverErr) {
                    // Silently fail and use default cover
                }

                // 3. Map Category & Tags
                const subjects = gutBook.subjects || [];
                let category = 'Fiction'; // Default
                if (subjects.some(s => s.toLowerCase().includes('science'))) category = 'Technology';
                else if (subjects.some(s => s.toLowerCase().includes('history'))) category = 'History';
                else if (subjects.some(s => s.toLowerCase().includes('design'))) category = 'Design';
                else if (subjects.some(s => s.toLowerCase().includes('business'))) category = 'Business';

                const tags = subjects.slice(0, 3);

                // 4. Create Book in DB
                await prisma.book.create({
                    data: {
                        title: gutBook.title,
                        author: gutBook.authors[0]?.name || 'Unknown Author',
                        description: `A classic work of literature. Available for reading in the READSTACK platform. Subject: ${subjects.slice(0,2).join(', ')}.`,
                        category: category,
                        price: Math.floor(Math.random() * (299 - 49 + 1) + 49),
                        preview_pdf_url: pdfUrl, 
                        full_pdf_url: pdfUrl,
                        cover_url: coverUrl,
                        tags: tags
                    }
                });

                importedCount++;
                console.log(`✅ Imported (${importedCount}/32): ${gutBook.title}`);
            }
        }

        console.log(`\n🎉 Successfully imported ${importedCount} real books with PDFs!`);

    } catch (error) {
        console.error('❌ Critical error during import:', error.message);
    } finally {
        process.exit();
    }
}

importBooks();
