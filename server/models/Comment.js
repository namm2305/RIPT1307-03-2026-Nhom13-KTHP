const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung câu trả lời']
    },
    question: {
        type: mongoose.Schema.ObjectId,
        ref: 'Question',
        required: true
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    parentComment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
        default: null
    },
    votes: {
        type: Number,
        default: 0
    },
    voters: [{
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        type: { type: String, enum: ['up', 'down'] }
    }],
    isAccepted: {
        type: Boolean,
        default: false
    },
    isVerifiedByLecturer: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment',
    justOne: false
});

commentSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

commentSchema.index({ question: 1, createdAt: 1 });
commentSchema.index({ author: 1 });

module.exports = mongoose.model('Comment', commentSchema);
