const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const Tag = require('../models/Tag');
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.use(protect);
router.use(authorize('admin', 'moderator')); 

router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        
        const totalQuestions = await Question.countDocuments();
        const totalComments = await Comment.countDocuments();
        const totalTags = await Tag.countDocuments();
        const totalSubjects = await Subject.countDocuments();

        const rolesCount = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const questionsBySubject = await Question.aggregate([
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectData' } },
            { $unwind: { path: '$subjectData', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 1, count: 1, subjectName: { $ifNull: ['$subjectData.name', 'Chưa phân loại'] } } }
        ]);

        const questionsByTag = await Question.aggregate([
            { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                users: { total: totalUsers, active: activeUsers, inactive: inactiveUsers },
                questions: totalQuestions,
                comments: totalComments,
                tags: totalTags,
                subjects: totalSubjects
            },
            charts: {
                roles: rolesCount.map(r => ({ role: r._id, count: r.count })),
                subjects: questionsBySubject.map(s => ({ subject: s.subjectName, count: s.count })),
                tags: questionsByTag.map(t => ({ tag: t._id, count: t.count }))
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.get('/logs', authorize('admin'), async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate('user', 'name email role avatar')
            .populate('affectedUser', 'name email role avatar')
            .sort({ createdAt: -1 })
            .limit(100); 
        return res.status(200).json({ success: true, logs });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.get('/questions', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        let query = {};
        
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const questions = await Question.find(query)
            .populate('author', 'name email')
            .populate('subject', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Question.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: questions.length,
            total,
            questions
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.delete('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }
        const { reason } = req.body;
        const questionTitle = question.title;
        const questionContent = question.content;
        const questionAuthor = question.author;

        try {
            if (question.author && question.author.toString() !== req.user._id.toString()) {
                await Notification.create({
                    user: question.author,
                    sender: req.user._id,
                    type: 'SYSTEM_ALERT',
                    message: `Câu hỏi "${question.title}" của bạn đã bị xóa bởi ban quản trị. Lý do: ${reason || 'Không có lý do được cung cấp.'}`,
                    link: `/`
                });
            }
        } catch (notifErr) {
            console.error('Lỗi khi tạo thông báo xóa câu hỏi trong admin:', notifErr);
        }

        await Comment.deleteMany({ question: question._id });
        await question.deleteOne();

        try {
            // Ghi nhật ký hoạt động
            await ActivityLog.create({
                action: `Xóa câu hỏi: "${questionTitle}"`,
                user: req.user._id,
                affectedUser: questionAuthor,
                targetId: req.params.id,
                targetModel: 'Question',
                deletedContent: questionContent,
                details: `IP: ${req.ip}${reason ? ' | Lý do: ' + reason : ''}`
            });
        } catch (logError) {
            console.error('Lỗi khi ghi ActivityLog xóa câu hỏi (admin):', logError);
        }

        return res.status(200).json({ success: true, message: 'Đã xóa câu hỏi' });
    } catch (error) {
        console.error('Lỗi khi admin xóa câu hỏi:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});



router.put('/questions/:id/toggle-solve', logActivity('Đánh dấu giải quyết câu hỏi', 'Question', req => req.params.id), async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }

        question.isSolved = !question.isSolved;
        await question.save();

        return res.status(200).json({ success: true, question });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
