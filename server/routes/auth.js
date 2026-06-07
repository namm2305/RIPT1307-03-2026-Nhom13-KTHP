const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper: tạo JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Helper: format user response (không trả password)
const formatUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleDisplay: user.getRoleDisplay(),
    faculty: user.faculty,
    studentId: user.studentId,
    bio: user.bio,
    avatar: user.avatar,
    reputation: user.reputation,
    isActive: user.isActive,
    joinDate: user.joinDate,
    lastLogin: user.lastLogin
});

// ─────────────────────────────────────────────────────────────
// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, faculty, studentId } = req.body;

        // Validate bắt buộc
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
        }

        // Không cho phép đăng ký role admin qua API công khai
        const allowedRoles = ['student', 'lecturer'];
        const assignedRole = allowedRoles.includes(role) ? role : 'student';

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email này đã được đăng ký, vui lòng dùng email khác' });
        }

        // Tạo user mới
        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
            faculty: faculty || 'Khoa Công nghệ Thông tin 1',
            studentId: studentId || ''
        });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            token,
            user: formatUserResponse(user)
        });
    } catch (error) {
        // Lỗi validation của mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        console.error('Register error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau' });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
        }

        // Lấy user kèm password (field select:false)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Tài khoản đã bị khoá, liên hệ quản trị viên' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        }

        // Cập nhật lastLogin
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            token,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau' });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc    Lấy thông tin user hiện tại (từ token)
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        return res.status(200).json({
            success: true,
            user: formatUserResponse(user)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc    Cập nhật hồ sơ (name, bio)
// @route   PUT /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────
router.put('/me', protect, async (req, res) => {
    try {
        const { name, bio, faculty, studentId } = req.body;

        const updates = {};
        if (name && name.trim()) updates.name = name.trim();
        if (bio !== undefined) updates.bio = bio.trim();
        if (faculty) updates.faculty = faculty;
        if (studentId !== undefined) updates.studentId = studentId.trim();

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Cập nhật hồ sơ thành công',
            user: formatUserResponse(user)
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc    Đổi mật khẩu
// @route   PUT /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải ít nhất 6 ký tự' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
