const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/count', async (req, res) => {
    try {
        const total = await User.countDocuments({ isActive: true });
        return res.status(200).json({ success: true, total });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.get('/', protect, authorize('admin', 'moderator', 'lecturer'), async (req, res) => {
    try {
        const { role, faculty, search, page = 1, limit = 20, isActive } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (faculty) filter.faculty = faculty;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            users
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const isSelf = req.user._id.toString() === req.params.id;
        const isPrivileged = ['admin', 'moderator'].includes(req.user.role);

        const user = await User.findById(req.params.id)
            .select('-password')
            .populate({ path: 'postedQuestions', select: 'title tags viewCount votes answersCount createdAt', options: { limit: 10, sort: { createdAt: -1 } } })
            .populate({ path: 'postedAnswers', select: 'content votes isAccepted question createdAt', populate: { path: 'question', select: 'title' }, options: { limit: 10, sort: { createdAt: -1 } } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        if (!isSelf && !isPrivileged) {
            user.email = '--- Đã ẩn ---';
        }

        if (user && user.avatar && (user.avatar.includes('T%E1%BA%ADp_tin:Logo_PTIT') || user.avatar.includes('portal.ptit.edu.vn') || user.avatar.includes('Tập_tin:Logo_PTIT') || user.avatar.includes('wikimedia.org'))) {
            user.avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJUAAACUCAMAAACtIJvYAAAA2FBMVEX';
            await user.save({ validateBeforeSave: false });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['student', 'lecturer', 'moderator', 'admin'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: `Role không hợp lệ. Các role hợp lệ: ${validRoles.join(', ')}` });
        }

        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ success: false, message: 'Không thể thay đổi role của chính mình' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        return res.status(200).json({
            success: true,
            message: `Đã cập nhật role thành "${role}" cho ${user.name}`,
            user
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/toggle-active', protect, authorize('admin', 'moderator'), async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ success: false, message: 'Không thể khoá tài khoản của chính mình' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        if (user.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền khoá tài khoản Admin' });
        }

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: `Tài khoản ${user.name} đã ${user.isActive ? 'mở khoá' : 'bị khoá'}`,
            isActive: user.isActive
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ success: false, message: 'Không thể xoá tài khoản của chính mình' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        return res.status(200).json({ success: true, message: `Đã xoá tài khoản ${user.name}` });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.get('/stats/overview', protect, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const [roleStats, facultyStats, totalActive, totalInactive] = await Promise.all([
            User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
            User.aggregate([{ $group: { _id: '$faculty', count: { $sum: 1 } } }]),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: false })
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                byRole: roleStats,
                byFaculty: facultyStats,
                active: totalActive,
                inactive: totalInactive,
                total: totalActive + totalInactive
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['student', 'lecturer', 'moderator', 'admin'];
        
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ' });
        }

        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Không thể thay đổi vai trò của chính mình' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/toggle-active', protect, authorize('admin'), async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản của chính mình' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
            user
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
