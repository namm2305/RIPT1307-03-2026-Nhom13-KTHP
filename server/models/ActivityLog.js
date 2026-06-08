const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    affectedUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    targetId: {
        type: mongoose.Schema.Types.Mixed, 
        default: null
    },
    targetModel: {
        type: String,
        enum: ['User', 'Question', 'Comment', 'Tag', 'Subject', null],
        default: null
    },
    deletedContent: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
