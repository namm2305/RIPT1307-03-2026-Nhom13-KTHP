const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
        return res.status(200).json({ success: true, subjects });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.get('/all', protect, authorize('admin', 'moderator'), async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, subjects });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.post('/', protect, authorize('admin'), logActivity('Tạo môn học', 'Subject', req => null), async (req, res) => {
    try {
        const { code, name, description } = req.body;
        if (!code || !name) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã và tên môn học' });

        const existing = await Subject.findOne({ code });
        if (existing) return res.status(400).json({ success: false, message: 'Mã môn học đã tồn tại' });

        const subject = await Subject.create({ code, name, description });
        return res.status(201).json({ success: true, subject });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id', protect, authorize('admin'), logActivity('Cập nhật môn học', 'Subject', req => req.params.id), async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subject) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });
        return res.status(200).json({ success: true, subject });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.delete('/:id', protect, authorize('admin'), logActivity('Xóa môn học', 'Subject', req => req.params.id), async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });
        return res.status(200).json({ success: true, message: 'Đã xóa môn học' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
