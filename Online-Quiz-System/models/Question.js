const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, 'Please specify category'],
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy'
    },
    q: {
        type: String,
        required: [true, 'Please add a question text'],
        trim: true
    },
    options: {
        type: [String],
        validate: [arrayLimit, 'Options array must contain exactly 4 items']
    },
    answer: {
        type: Number,
        required: [true, 'Please specify correct answer index (0-3)'],
        min: 0,
        max: 3
    },
    explanation: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

function arrayLimit(val) {
    return val.length === 4;
}

module.exports = mongoose.model('Question', QuestionSchema);
