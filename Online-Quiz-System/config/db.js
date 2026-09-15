const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizpro', {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (err) {
        console.warn(`MongoDB Connection Warning: ${err.message}. (Server will operate with hybrid fallback mode)`);
        return false;
    }
};

module.exports = connectDB;
