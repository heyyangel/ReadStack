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
app.get('/api/seed-database', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const axios = require('axios');
        const prisma = new PrismaClient();
        
        // 1. CLEAR ALL EXISTING BOOKS (Hard Reset)
        await prisma.book.deleteMany({});
        
        // 2. Fetch popular books from Open Library
        const response = await axios.get('https://openlibrary.org/search.json?q=classic+fiction&limit=12');
        const docs = response.data.docs;

        const booksToInsert = docs
            .filter(doc => doc.title && doc.author_name && doc.cover_i) // Only use books with covers
            .map(doc => ({
                title: doc.title,
                author: doc.author_name[0],
                description: doc.first_sentence ? doc.first_sentence[0] : "A timeless classic from the global literary archives.",
                price: Math.floor(Math.random() * (25 - 10 + 1) + 10) + 0.99, // Random price between 10-25
                category: doc.subject ? doc.subject[0] : "Classic",
                cover_url: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
                stock: 20
            }));

        for (const book of booksToInsert) {
            await prisma.book.create({
                data: book
            });
        }
        
        res.json({ 
            success: true, 
            message: `Successfully seeded ${booksToInsert.length} books from Open Library!`,
            books: booksToInsert.map(b => b.title)
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
