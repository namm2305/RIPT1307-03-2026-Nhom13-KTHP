const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);
        
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

        return res.status(200).json({ success: true, unreadCount, notifications });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );
        return res.status(200).json({ success: true, notification });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
