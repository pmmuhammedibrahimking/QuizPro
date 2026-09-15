const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false // Allow inline scripts for local demo
}));
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting (100 requests per 10 mins)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, './')));

// Fallback to index.html for unknown routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.status(404).json({ success: false, error: 'API route not found' });
    }
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 QuizPro Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`=================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
});
