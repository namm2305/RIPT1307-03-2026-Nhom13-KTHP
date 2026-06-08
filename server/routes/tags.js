const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const Question = require('../models/Question');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.get('/', async (req, res) => {
    try {
        const tags = await Tag.find().sort({ name: 1 });
        return res.status(200).json({ success: true, tags });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.post('/', protect, authorize('admin', 'moderator'), logActivity('Tạo Tag', 'Tag', req => null), async (req, res) => {
    try {
        const { name, description, color } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Vui lòng nhập tên thẻ' });

        const existing = await Tag.findOne({ name });
        if (existing) return res.status(400).json({ success: false, message: 'Thẻ đã tồn tại' });

        const tag = await Tag.create({ name, description, color });
        return res.status(201).json({ success: true, tag });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id', protect, authorize('admin', 'moderator'), logActivity('Cập nhật Tag', 'Tag', req => req.params.id), async (req, res) => {
    try {
        const oldTag = await Tag.findById(req.params.id);
        if (!oldTag) return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
        
        const oldName = oldTag.name;

        const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (req.body.name && req.body.name !== oldName) {
            await Question.updateMany(
                { tags: oldName },
                { $set: { "tags.$": req.body.name } }
            );
        }

        return res.status(200).json({ success: true, tag });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.delete('/:id', protect, authorize('admin'), logActivity('Xóa Tag', 'Tag', req => req.params.id), async (req, res) => {
    try {
        const tag = await Tag.findByIdAndDelete(req.params.id);
        if (!tag) return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
        return res.status(200).json({ success: true, message: 'Đã xóa thẻ' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
