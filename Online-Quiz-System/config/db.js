const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizpro', {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed default users if none exist
        try {
            const User = require('../models/User');
            const adminExists = await User.findOne({ email: 'admin@quizpro.com' });
            if (!adminExists) {
                await User.create({
                    name: 'System Admin',
                    email: 'admin@quizpro.com',
                    password: 'admin',
                    role: 'admin',
                    regNumber: 'ADMIN001',
                    department: 'BCA'
                });
                console.log('✅ Seeded default admin user (admin@quizpro.com / admin)');
            }

            const demoStudentExists = await User.findOne({ email: 'student@quizpro.com' });
            if (!demoStudentExists) {
                await User.create({
                    name: 'Sample Student',
                    email: 'student@quizpro.com',
                    password: 'student',
                    role: 'student',
                    regNumber: 'BCA202601',
                    department: 'BCA'
                });
                console.log('✅ Seeded default student user (student@quizpro.com / student)');
            }
        } catch (seedErr) {
            console.warn('Seed error:', seedErr.message);
        }

        return true;
    } catch (err) {
        console.warn(`MongoDB Connection Warning: ${err.message}. (Server will operate with hybrid fallback mode)`);
        return false;
    }
};

module.exports = connectDB;
