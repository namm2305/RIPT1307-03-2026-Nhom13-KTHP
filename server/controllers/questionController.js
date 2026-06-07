const Question = require('../models/Question');
const Comment = require('../models/Comment');


exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('author', 'name avatar role')
            .sort({ createdAt: -1 })
            .lean();

        // Đếm số câu trả lời (comment gốc, không có parentComment) cho mỗi câu hỏi
        const answerCounts = await Comment.aggregate([
            { $match: { parentComment: null } },
            { $group: { _id: '$question', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        answerCounts.forEach(item => {
            countMap[item._id.toString()] = item.count;
        });

        const questionsWithCount = questions.map(q => ({
            ...q,
            answersCount: countMap[q._id.toString()] || 0
        }));

        res.status(200).json({
            success: true,
            count: questionsWithCount.length,
            data: questionsWithCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('author', 'name avatar role faculty')
            .populate('voters.user', 'name');

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.viewCount += 1;
        await question.save();

        res.status(200).json({
            success: true,
            data: question
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.voteQuestion = async (req, res) => {
    try {
        const { type } = req.body;

        if (!['up', 'down'].includes(type)) {
            return res.status(400).json({ message: 'Vote type must be "up" or "down"' });
        }

        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const existingVoteIndex = question.voters.findIndex(
            v => v.user.toString() === req.user.id
        );

        if (existingVoteIndex !== -1) {
            const existingVote = question.voters[existingVoteIndex];

            if (existingVote.type === type) {
                question.voters.splice(existingVoteIndex, 1);
                question.votes += type === 'up' ? -1 : 1;
            } else {
                existingVote.type = type;
                question.votes += type === 'up' ? 2 : -2;
            }
        } else {
            question.voters.push({ user: req.user.id, type });
            question.votes += type === 'up' ? 1 : -1;
        }

        await question.save();

        res.status(200).json({
            success: true,
            data: {
                votes: question.votes,
                voters: question.voters
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ question: req.params.id })
            .populate('author', 'name avatar role')
            .populate('voters.user', 'name')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.addComment = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const { content, parentComment } = req.body;

        if (parentComment) {
            const parentExists = await Comment.findById(parentComment);
            if (!parentExists) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
        }

        const comment = await Comment.create({
            content,
            question: req.params.id,
            author: req.user.id,
            parentComment: parentComment || null
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name avatar role');

        res.status(201).json({
            success: true,
            data: populatedComment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.voteComment = async (req, res) => {
    try {
        const { type } = req.body;

        if (!['up', 'down'].includes(type)) {
            return res.status(400).json({ message: 'Vote type must be "up" or "down"' });
        }

        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const existingVoteIndex = comment.voters.findIndex(
            v => v.user.toString() === req.user.id
        );

        if (existingVoteIndex !== -1) {
            const existingVote = comment.voters[existingVoteIndex];

            if (existingVote.type === type) {
                comment.voters.splice(existingVoteIndex, 1);
                comment.votes += type === 'up' ? -1 : 1;
            } else {
                existingVote.type = type;
                comment.votes += type === 'up' ? 2 : -2;
            }
        } else {
            comment.voters.push({ user: req.user.id, type });
            comment.votes += type === 'up' ? 1 : -1;
        }

        await comment.save();

        res.status(200).json({
            success: true,
            data: {
                votes: comment.votes,
                voters: comment.voters
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await Comment.deleteMany({ parentComment: req.params.commentId });
        await Comment.findByIdAndDelete(req.params.commentId);

        res.status(200).json({
            success: true,
            message: 'Comment deleted'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
