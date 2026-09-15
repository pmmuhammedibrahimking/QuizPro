const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userDepartment: {
        type: String,
        default: 'N/A'
    },
    category: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        default: 'easy'
    },
    score: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    totalTimeTaken: {
        type: Number,
        default: 0
    },
    answers: [{
        questionId: String,
        questionText: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        explanation: String,
        timeTaken: Number
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
