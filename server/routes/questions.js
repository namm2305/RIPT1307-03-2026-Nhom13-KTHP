const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
// @desc    Lấy danh sách câu hỏi (có filter, search, phân trang)
// @route   GET /api/questions
// @access  Public
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// @desc    Lấy chi tiết 1 câu hỏi + câu trả lời
// @route   GET /api/questions/:id
// @access  Public
// ─────────────────────────────────────────────────────────────
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

        // Tăng lượt xem
        await Question.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

        return res.status(200).json({ success: true, question });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc    Đăng câu hỏi mới
// @route   POST /api/questions
// @access  Private (mọi user đã đăng nhập)
// ─────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề và nội dung' });
        }

        const question = await Question.create({
            title,
            content,
            tags: tags || [],
            author: req.user._id
        });

        // Cộng điểm reputation cho người đăng câu hỏi
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

// ─────────────────────────────────────────────────────────────
// @desc    Sửa câu hỏi
// @route   PUT /api/questions/:id
// @access  Private (chủ sở hữu, moderator, admin)
// ─────────────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

        const isOwner = question.author.toString() === req.user._id.toString();
        const isPrivileged = ['admin', 'moderator'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: 'Không có quyền sửa câu hỏi này' });
        }

        const { title, content, tags, isClosed, closedReason, isPinned } = req.body;

        if (title) question.title = title;
        if (content) question.content = content;
        if (tags) question.tags = tags;

        // Chỉ moderator/admin mới được đóng/ghim câu hỏi
        if (isPrivileged) {
            if (isClosed !== undefined) question.isClosed = isClosed;
            if (closedReason !== undefined) question.closedReason = closedReason;
            if (isPinned !== undefined) question.isPinned = isPinned;
        }

        await question.save();

        return res.status(200).json({ success: true, question });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc    Vote câu hỏi
// @route   PUT /api/questions/:id/vote
// @access  Private
// ─────────────────────────────────────────────────────────────
router.put('/:id/vote', protect, async (req, res) => {
    try {
        const { type } = req.body; // 'up' | 'down'
        if (!['up', 'down'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Loại vote không hợp lệ' });
        }

        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

        const userId = req.user._id;
        const existingVote = question.voters.find(v => v.user.toString() === userId.toString());

        if (existingVote) {
            if (existingVote.type === type) {
                // Bỏ vote
                question.voters = question.voters.filter(v => v.user.toString() !== userId.toString());
                question.votes += type === 'up' ? -1 : 1;
            } else {
                // Đổi vote
                existingVote.type = type;
                question.votes += type === 'up' ? 2 : -2;
            }
        } else {
            question.voters.push({ user: userId, type });
            question.votes += type === 'up' ? 1 : -1;
        }

        await question.save();

        return res.status(200).json({ success: true, votes: question.votes });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ─────────────────────────────────────────────────────────────
// @desc    Xoá câu hỏi
// @route   DELETE /api/questions/:id
// @access  Private (chủ sở hữu, moderator, admin)
// ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

        const isOwner = question.author.toString() === req.user._id.toString();
        const isPrivileged = ['admin', 'moderator'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: 'Không có quyền xoá câu hỏi này' });
        }

        await Comment.deleteMany({ question: req.params.id });
        await Question.findByIdAndDelete(req.params.id);

        return res.status(200).json({ success: true, message: 'Đã xoá câu hỏi' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ─────────────────────────────────────────────────────────────
// ANSWERS (Comments) dưới câu hỏi
// ─────────────────────────────────────────────────────────────

// @route   POST /api/questions/:id/answers
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

        // Cộng điểm reputation
        await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 10 } });

        const populated = await answer.populate('author', 'name avatar role faculty reputation');

        return res.status(201).json({ success: true, answer: populated });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// @route   PUT /api/questions/:id/answers/:answerId/accept
// Chỉ chủ câu hỏi, lecturer, hoặc admin mới được chấp nhận
router.put('/:id/answers/:answerId/accept', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

        const isOwner = question.author.toString() === req.user._id.toString();
        const isPrivileged = ['admin', 'moderator', 'lecturer'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: 'Chỉ chủ câu hỏi mới được chấp nhận câu trả lời' });
        }

        // Bỏ accepted cũ
        await Comment.updateMany({ question: req.params.id }, { isAccepted: false });

        const answer = await Comment.findByIdAndUpdate(
            req.params.answerId,
            { isAccepted: true },
            { new: true }
        );

        if (!answer) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });

        question.acceptedAnswer = answer._id;
        await question.save();

        // Cộng 15 điểm cho người có câu trả lời được chấp nhận
        await User.findByIdAndUpdate(answer.author, { $inc: { reputation: 15 } });

        return res.status(200).json({ success: true, message: 'Đã chấp nhận câu trả lời' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// @route   PUT /api/questions/:id/answers/:answerId/verify
// Chỉ lecturer/admin xác nhận câu trả lời đúng về mặt học thuật
router.put('/:id/answers/:answerId/verify', protect, authorize('lecturer', 'admin'), async (req, res) => {
    try {
        const answer = await Comment.findByIdAndUpdate(
            req.params.answerId,
            { isVerifiedByLecturer: true, verifiedBy: req.user._id },
            { new: true }
        ).populate('verifiedBy', 'name role');

        if (!answer) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });

        return res.status(200).json({ success: true, message: 'Đã xác nhận câu trả lời', answer });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
