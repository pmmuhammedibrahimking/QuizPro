const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// @route   GET /api/quizzes/categories
// @desc    Get all available categories
// @access  Public
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/quizzes/questions
// @desc    Get randomized quiz questions filtered by category & difficulty
// @access  Public
router.get('/questions', async (req, res, next) => {
    try {
        const { category, difficulty, limit = 50 } = req.query;
        let query = {};

        if (category && category !== 'All' && category !== 'All Categories') {
            query.category = category;
        }
        if (difficulty) {
            query.difficulty = difficulty;
        }

        let questions = await Question.find(query);

        // Shuffle questions
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        const maxQuestions = Math.min(parseInt(limit), questions.length);
        const selectedQuestions = questions.slice(0, maxQuestions);

        res.status(200).json({
            success: true,
            count: selectedQuestions.length,
            data: selectedQuestions
        });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/quizzes/submit
// @desc    Submit completed quiz attempt
// @access  Private
router.post('/submit', protect, async (req, res, next) => {
    try {
        const { category, difficulty, score, total, answers, totalTimeTaken } = req.body;

        const percentage = parseFloat(((score / total) * 100).toFixed(1));
        let grade = 'Fail';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';

        const attempt = await QuizAttempt.create({
            user: req.user._id,
            userName: req.user.name,
            userDepartment: req.user.department || 'N/A',
            category,
            difficulty: difficulty || 'easy',
            score,
            total,
            percentage,
            grade,
            totalTimeTaken: totalTimeTaken || 0,
            answers: answers || []
        });

        // Issue Certificate if passed (score >= 60%)
        if (percentage >= 60) {
            const certId = 'QP' + new Date().getFullYear() + String(attempt._id).slice(-4).toUpperCase();
            await Certificate.create({
                user: req.user._id,
                userName: req.user.name,
                category,
                score,
                percentage,
                grade,
                certId
            });
        }

        res.status(201).json({
            success: true,
            data: attempt
        });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/quizzes/history
// @desc    Get logged in user's isolated quiz attempt history
// @access  Private
router.get('/history', protect, async (req, res, next) => {
    try {
        const history = await QuizAttempt.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/quizzes/leaderboard
// @desc    Get overall global leaderboard
// @access  Public
router.get('/leaderboard', async (req, res, next) => {
    try {
        const attempts = await QuizAttempt.find()
            .sort({ score: -1, totalTimeTaken: 1 })
            .limit(50);

        const leaderboard = attempts.map((a, idx) => ({
            rank: idx + 1,
            name: a.userName,
            department: a.userDepartment,
            score: a.score,
            total: a.total,
            percentage: a.percentage,
            category: a.category,
            timeTaken: a.totalTimeTaken,
            date: a.date
        }));

        res.status(200).json({
            success: true,
            count: leaderboard.length,
            data: leaderboard
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
