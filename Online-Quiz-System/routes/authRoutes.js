const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            regNumber: user.regNumber,
            department: user.department
        }
    });
};

const MAX_USERS_LIMIT = 40;

// @route   POST /api/auth/register
// @desc    Register new user (Max limit 40 members)
// @access  Public
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, regNumber, department, role } = req.body;

        // Count existing registered users
        const totalUsersCount = await User.countDocuments({ role: 'user' });
        if (totalUsersCount >= MAX_USERS_LIMIT) {
            return res.status(403).json({
                success: false,
                error: 'Registration is closed. The maximum limit of 40 members has been reached.'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            regNumber: regNumber || '',
            department: department || 'BCA',
            role: role === 'admin' ? 'admin' : 'user'
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/auth/login
// @desc    Login user & return JWT
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear token
// @access  Private
router.post('/logout', protect, (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res, next) => {
    try {
        const { name, department, regNumber } = req.body;
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (department) fieldsToUpdate.department = department;
        if (regNumber !== undefined) fieldsToUpdate.regNumber = regNumber;

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, user });
    } catch (err) {
        next(err);
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'There is no user with that email' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Reset token generated',
            resetToken
        });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
