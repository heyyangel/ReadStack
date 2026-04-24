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
        const prisma = new PrismaClient();
        
        // This is a simplified version of your seed.js
        const books = [
            {
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                description: "A story of wealth, love, and the American Dream.",
                price: 15.99,
                category: "Fiction",
                cover_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800",
                stock: 10
            },
            {
                title: "Atomic Habits",
                author: "James Clear",
                description: "An easy & proven way to build good habits & break bad ones.",
                price: 24.99,
                category: "Self-Help",
                cover_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800",
                stock: 25
            },
            {
                title: "The Alchemist",
                author: "Paulo Coelho",
                description: "A fable about following your dream.",
                price: 18.50,
                category: "Fiction",
                cover_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800",
                stock: 15
            }
        ];

        for (const book of books) {
            await prisma.book.upsert({
                where: { book_title_author: { title: book.title, author: book.author } },
                update: {
                    cover_url: book.cover_url,
                    description: book.description,
                    price: book.price
                },
                create: book
            });
        }
        
        res.json({ success: true, message: "Database seeded successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
