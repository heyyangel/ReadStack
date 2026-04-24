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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
