const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true 
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null 
    },
    type: {
        type: String,
        enum: ['NEW_COMMENT', 'ACCEPTED_ANSWER', 'SYSTEM_ALERT', 'ROLE_CHANGED', 'NEW_ANSWER', 'QUESTION_VOTED', 'QUESTION_UPDATED', 'ANSWER_VERIFIED'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: '' 
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
