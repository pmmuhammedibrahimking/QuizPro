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
        const cleanName = (name || '').trim();
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();
        const cleanReg = (regNumber || '').trim();

        if (!cleanName || !cleanEmail || !cleanPass) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields' });
        }

        // Count existing registered users
        const totalUsersCount = await User.countDocuments({ role: { $in: ['user', 'student'] } });
        if (totalUsersCount >= MAX_USERS_LIMIT) {
            return res.status(403).json({
                success: false,
                error: 'Registration is closed. The maximum limit of 40 members has been reached.'
            });
        }

        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User with this email already exists' });
        }

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: cleanPass,
            regNumber: cleanReg || ('BCA' + Math.floor(100000 + Math.random() * 900000)),
            department: department || 'BCA',
            role: role === 'admin' ? 'admin' : (role || 'student')
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
        const cleanInput = (email || '').trim();
        const cleanPass = (password || '').trim();

        if (!cleanInput || !cleanPass) {
            return res.status(400).json({ success: false, error: 'Please enter both your email / register number and password.' });
        }

        const escapedInput = cleanInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const user = await User.findOne({
            $or: [
                { email: { $regex: new RegExp(`^${escapedInput}$`, 'i') } },
                { regNumber: { $regex: new RegExp(`^${escapedInput}$`, 'i') } }
            ]
        }).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'Account not found. Please check your email/register number or create an account.' });
        }

        const isMatch = (await user.matchPassword(cleanPass)) || (await user.matchPassword(password));
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect password entered.' });
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
// @desc    Reset password using token or verified email
// @access  Public
router.post('/reset-password', async (req, res, next) => {
    try {
        const { resetToken, newPassword, email } = req.body;
        let user;

        if (resetToken) {
            const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            user = await User.findOne({
                resetPasswordToken,
                resetPasswordExpire: { $gt: Date.now() }
            });
        }

        if (!user && email) {
            user = await User.findOne({ email: email.toLowerCase() });
        }

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid reset request or account not found' });
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

// @route   POST /api/auth/forgot-email
// @desc    Find/Recover email by Register Number or Full Name
// @access  Public
router.post('/forgot-email', async (req, res, next) => {
    try {
        const { regNumber, name, department } = req.body;
        
        let query = {};
        if (regNumber && regNumber.trim()) {
            query.regNumber = { $regex: new RegExp(`^${regNumber.trim()}$`, 'i') };
        } else if (name && name.trim()) {
            query.name = { $regex: new RegExp(name.trim(), 'i') };
            if (department && department !== 'All') {
                query.department = department;
            }
        } else {
            return res.status(400).json({ success: false, error: 'Please provide a Register Number or Full Name' });
        }

        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ success: false, error: 'No matching user account found' });
        }

        res.status(200).json({
            success: true,
            email: user.email,
            name: user.name,
            regNumber: user.regNumber,
            department: user.department,
            message: `Account found for ${user.name}`
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
