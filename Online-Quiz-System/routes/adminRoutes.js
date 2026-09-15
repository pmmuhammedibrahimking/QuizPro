const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes below with Protect + Admin RBAC Authorization
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard metrics & analytics
// @access  Private/Admin
router.get('/dashboard', async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const maxUsersLimit = 40;
        const remainingSlots = Math.max(0, maxUsersLimit - totalUsers);
        const totalQuestions = await Question.countDocuments();
        const totalAttempts = await QuizAttempt.countDocuments();
        const passedAttempts = await QuizAttempt.countDocuments({ percentage: { $gte: 60 } });
        
        const passRate = totalAttempts > 0 ? parseFloat(((passedAttempts / totalAttempts) * 100).toFixed(1)) : 0;
        
        const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5);
        const recentAttempts = await QuizAttempt.find().sort({ date: -1 }).limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                maxUsersLimit,
                remainingSlots,
                totalQuestions,
                totalAttempts,
                passRate: `${passRate}%`,
                recentUsers,
                recentAttempts
            }
        });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account and their attempt records
// @access  Private/Admin
router.delete('/users/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await QuizAttempt.deleteMany({ user: user._id });
        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User and history deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/admin/questions
// @desc    Create new question
// @access  Private/Admin
router.post('/questions', async (req, res, next) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json({ success: true, data: question });
    } catch (err) {
        next(err);
    }
});

// @route   PUT /api/admin/questions/:id
// @desc    Update existing question
// @access  Private/Admin
router.put('/questions/:id', async (req, res, next) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }
        res.status(200).json({ success: true, data: question });
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/admin/questions/:id
// @desc    Delete question
// @access  Private/Admin
router.delete('/questions/:id', async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }
        await question.deleteOne();
        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
