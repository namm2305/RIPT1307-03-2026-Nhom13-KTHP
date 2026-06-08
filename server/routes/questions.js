const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');

const sendNotificationToFollowers = async (question, senderId, type, message, link) => {
    const recipients = new Set();
    if (question.author) recipients.add(question.author.toString());
    
    if (Array.isArray(question.voters)) {
        question.voters.forEach(v => {
            if (v.type === 'up' && v.user) recipients.add(v.user.toString());
        });
    }

    if (senderId) recipients.delete(senderId.toString());

    const notifications = Array.from(recipients).map(userId => ({
        user: userId,
        sender: senderId,
        type,
        message,
        link
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }
};

router.get('/test-logs', async (req, res) => {
    const ActivityLog = require('../models/ActivityLog');
    const logs = await ActivityLog.find().populate('affectedUser', 'name').sort({ createdAt: -1 }).limit(2);
    res.json(logs);
});

router.get('/', async (req, res) => {
    try {
        const { tag, search, sort = 'latest', page = 1, limit = 10, author } = req.query;

        const filter = {};
        if (tag) filter.tags = tag;
        if (author) filter.author = author;
        if (search) filter.$text = { $search: search };

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') sortOption = { viewCount: -1 };
        if (sort === 'votes') sortOption = { votes: -1 };
        if (sort === 'unanswered') filter.answersCount = 0;

        const total = await Question.countDocuments(filter);
        const questions = await Question.find(filter)
            .populate('author', 'name avatar role faculty')
            .populate('answersCount')
            .sort(sortOption)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            questions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.get('/tags', async (req, res) => {
    try {
        const tags = await Question.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $project: { _id: 0, id: "$_id", name: "$_id", count: 1, description: { $concat: ["Thẻ thảo luận về ", "$_id"] } } },
            { $sort: { count: -1 } }
        ]);
        return res.status(200).json({ success: true, tags });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('author', 'name avatar role faculty reputation')
            .populate({
                path: 'answers',
                populate: [
                    { path: 'author', select: 'name avatar role faculty reputation' },
                    { path: 'verifiedBy', select: 'name role' },
                    { path: 'replies', populate: { path: 'author', select: 'name avatar role' } }
                ]
            });

        if (!question) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }

        const jwt = require('jsonwebtoken');
        let userId = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {}
        }

        if (userId) {
            if (!question.viewers.includes(userId)) {
                question.viewers.push(userId);
                question.viewCount += 1;
                await question.save();
            }
        } else {
            question.viewCount += 1;
            await question.save();
        }

        return res.status(200).json({ success: true, question });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const { title, content, tags, subject } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề và nội dung' });
        }

        let subjectId = null;
        if (subject) {
            if (mongoose.Types.ObjectId.isValid(subject)) {
                subjectId = subject;
            } else {
                const newCode = 'NEW-' + String(Date.now()).slice(-5);
                const newSubject = await Subject.create({
                    code: newCode,
                    name: subject,
                    isActive: true
                });
                subjectId = newSubject._id;
            }
        }

        const question = await Question.create({
            title,
            content,
            tags: tags || [],
            subject: subjectId,
            author: req.user._id
        });

        await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 5 } });

        const populated = await question.populate('author', 'name avatar role faculty');

        return res.status(201).json({ success: true, question: populated });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

        const isOwner = question.author.toString() === req.user._id.toString();
        const isPrivileged = ['admin', 'moderator', 'lecturer'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: 'Không có quyền sửa câu hỏi này' });
        }

        const { title, content, tags, isClosed, closedReason, isPinned } = req.body;

        if (title) question.title = title;
        if (content) question.content = content;
        if (tags) question.tags = tags;

        let statusMsg = '';
        if (isPrivileged) {
            if (isClosed !== undefined && question.isClosed !== isClosed) {
                question.isClosed = isClosed;
                statusMsg = isClosed ? 'bị khóa' : 'được mở khóa';
            }
            if (closedReason !== undefined) question.closedReason = closedReason;
            if (isPinned !== undefined && question.isPinned !== isPinned) {
                question.isPinned = isPinned;
                statusMsg = isPinned ? 'được ghim' : 'bị bỏ ghim';
            }
        }

        await question.save();

        if (statusMsg) {
            await sendNotificationToFollowers(question, req.user._id, 'QUESTION_UPDATED', `Câu hỏi "${question.title}" vừa ${statusMsg} bởi quản trị viên.`, `/question/${question._id}`);
        }

        return res.status(200).json({ success: true, question });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/vote', protect, async (req, res) => {
    try {
        const { type } = req.body; 
        if (!['up', 'down'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Loại vote không hợp lệ' });
        }

        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

        const userId = req.user._id;
        const existingVote = question.voters.find(v => v.user.toString() === userId.toString());

        if (existingVote) {
            if (existingVote.type === type) {
                question.voters = question.voters.filter(v => v.user.toString() !== userId.toString());
                question.votes += type === 'up' ? -1 : 1;
            } else {
                existingVote.type = type;
                question.votes += type === 'up' ? 2 : -2;
            }
        } else {
            question.voters.push({ user: userId, type });
            question.votes += type === 'up' ? 1 : -1;
        }

        await question.save();

        if (type === 'up' && (!existingVote || existingVote.type !== 'up')) {
            if (question.author.toString() !== req.user._id.toString()) {
                await Notification.create({
                    user: question.author,
                    sender: req.user._id,
                    type: 'QUESTION_VOTED',
                    message: `Một người dùng đã thích câu hỏi của bạn.`,
                    link: `/question/${question._id}`
                });
            }
        }

        return res.status(200).json({ success: true, votes: question.votes });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

        const isOwner = question.author.toString() === req.user._id.toString();
        const isPrivileged = ['admin', 'moderator', 'lecturer'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: 'Không có quyền xoá câu hỏi này' });
        }

        const { reason } = req.body;
        const questionTitle = question.title;

        try {
            if (question.author && question.author.toString() !== req.user._id.toString()) {
                await Notification.create({
                    user: question.author,
                    sender: req.user._id,
                    type: 'SYSTEM_ALERT',
                    message: `Câu hỏi "${question.title}" của bạn đã bị xóa. Lý do: ${reason || 'Không có lý do được cung cấp.'}`,
                    link: `/`
                });
            }
        } catch (notifErr) {
            console.error('Lỗi khi tạo thông báo xóa câu hỏi:', notifErr);
        }

        await Comment.deleteMany({ question: req.params.id });
        await Question.findByIdAndDelete(req.params.id);

        try {
            // Ghi nhật ký hoạt động
            const ActivityLog = require('../models/ActivityLog');
            await ActivityLog.create({
                action: `Xóa câu hỏi: "${questionTitle}"`,
                user: req.user._id,
                affectedUser: question.author,
                targetId: req.params.id,
                targetModel: 'Question',
                deletedContent: question.content,
                details: `IP: ${req.ip}${reason ? ' | Lý do: ' + reason : ''}`
            });
        } catch (logError) {
            console.error('Lỗi khi ghi ActivityLog xóa câu hỏi:', logError);
        }

        return res.status(200).json({ success: true, message: 'Đã xoá câu hỏi' });
    } catch (error) {
        console.error('Lỗi khi xoá câu hỏi:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});


router.post('/:id/answers', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        if (question.isClosed) return res.status(400).json({ success: false, message: 'Câu hỏi đã đóng, không nhận thêm câu trả lời' });

        const { content, parentComment } = req.body;
        if (!content) return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung' });

        const answer = await Comment.create({
            content,
            question: req.params.id,
            author: req.user._id,
            parentComment: parentComment || null
        });

        await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 10 } });

        await sendNotificationToFollowers(
            question, 
            req.user._id, 
            'NEW_ANSWER', 
            `Có câu trả lời mới trong câu hỏi "${question.title}".`, 
            `/question/${question._id}`
        );

        const populated = await answer.populate('author', 'name avatar role faculty reputation');

        return res.status(201).json({ success: true, answer: populated });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/answers/:answerId/accept', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

        const isOwner = question.author.toString() === req.user._id.toString();
        const isPrivileged = ['admin', 'moderator', 'lecturer'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: 'Chỉ chủ câu hỏi mới được chấp nhận câu trả lời' });
        }

        await Comment.updateMany({ question: req.params.id }, { isAccepted: false });

        const answer = await Comment.findByIdAndUpdate(
            req.params.answerId,
            { isAccepted: true },
            { new: true }
        );

        if (!answer) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });

        question.acceptedAnswer = answer._id;
        await question.save();

        await User.findByIdAndUpdate(answer.author, { $inc: { reputation: 15 } });

        if (answer.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: answer.author,
                sender: req.user._id,
                type: 'ACCEPTED_ANSWER',
                message: `Câu trả lời của bạn đã được tác giả chấp nhận.`,
                link: `/question/${question._id}`
            });
        }

        return res.status(200).json({ success: true, message: 'Đã chấp nhận câu trả lời' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/answers/:answerId/verify', protect, authorize('lecturer', 'admin'), async (req, res) => {
    try {
        const answer = await Comment.findByIdAndUpdate(
            req.params.answerId,
            { isVerifiedByLecturer: true, verifiedBy: req.user._id },
            { new: true }
        ).populate('verifiedBy', 'name role');

        if (!answer) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });

        const question = await Question.findById(answer.question);

        if (answer.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: answer.author,
                sender: req.user._id,
                type: 'ANSWER_VERIFIED',
                message: `Câu trả lời của bạn đã được giảng viên duyệt.`,
                link: `/question/${answer.question}`
            });
        }

        if (question) {
            await sendNotificationToFollowers(
                question,
                req.user._id,
                'ANSWER_VERIFIED',
                `Một câu trả lời trong câu hỏi "${question.title}" vừa được giảng viên duyệt.`,
                `/question/${question._id}`
            );
        }

        return res.status(200).json({ success: true, message: 'Đã xác nhận câu trả lời', answer });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.put('/:id/answers/:answerId/vote', protect, async (req, res) => {
    try {
        const { type } = req.body; 
        if (!['up', 'down'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Loại vote không hợp lệ' });
        }

        const answer = await Comment.findById(req.params.answerId);
        if (!answer) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });

        const userId = req.user._id;
        const existingVote = answer.voters.find(v => v.user.toString() === userId.toString());

        if (existingVote) {
            if (existingVote.type === type) {
                answer.voters = answer.voters.filter(v => v.user.toString() !== userId.toString());
                answer.votes += type === 'up' ? -1 : 1;
            } else {
                existingVote.type = type;
                answer.votes += type === 'up' ? 2 : -2;
            }
        } else {
            answer.voters.push({ user: userId, type });
            answer.votes += type === 'up' ? 1 : -1;
        }

        await answer.save();

        return res.status(200).json({ success: true, votes: answer.votes });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

router.delete('/:id/answers/:answerId', protect, async (req, res) => {
    try {
        const answer = await Comment.findById(req.params.answerId);
        if (!answer) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });

        const isOwner = answer.author.toString() === req.user._id.toString();
        const isPrivileged = ['admin', 'moderator', 'lecturer'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: 'Không có quyền xóa câu trả lời này' });
        }

        const { reason } = req.body;
        const answerContent = answer.content;
        const answerAuthor = answer.author;

        await Comment.deleteMany({ parentComment: answer._id });
        
        await Comment.findByIdAndDelete(answer._id);

        const question = await Question.findById(req.params.id);
        if (question && question.acceptedAnswer && question.acceptedAnswer.toString() === answer._id.toString()) {
            question.acceptedAnswer = null;
            await question.save();
        }

        try {
            // Gửi thông báo cho tác giả comment
            if (answerAuthor.toString() !== req.user._id.toString()) {
                await Notification.create({
                    user: answerAuthor,
                    sender: req.user._id,
                    type: 'SYSTEM_ALERT',
                    message: `Bình luận của bạn trong câu hỏi "${question ? question.title : ''}" đã bị xóa. Lý do: ${reason || 'Không có lý do được cung cấp.'}`,
                    link: question ? `/question/${question._id}` : '/'
                });
            }
        } catch (notifError) {
            console.error('Lỗi khi gửi thông báo xóa comment:', notifError);
        }

        try {
            // Ghi nhật ký hoạt động
            const ActivityLog = require('../models/ActivityLog');
            await ActivityLog.create({
                action: `Xóa bình luận trong câu hỏi: "${question ? question.title : 'Đã xóa'}"`,
                user: req.user._id,
                affectedUser: answerAuthor,
                targetId: req.params.answerId,
                targetModel: 'Comment',
                deletedContent: answerContent,
                details: `IP: ${req.ip}${reason ? ' | Lý do: ' + reason : ''}`
            });
        } catch (logError) {
            console.error('Lỗi khi ghi ActivityLog xóa comment:', logError);
        }

        return res.status(200).json({ success: true, message: 'Đã xóa câu trả lời' });
    } catch (error) {
        console.error('Lỗi route xóa comment:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
