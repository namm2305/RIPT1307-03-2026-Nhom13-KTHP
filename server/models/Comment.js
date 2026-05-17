const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Please add content']
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);
