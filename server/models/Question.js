const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề câu hỏi'],
        trim: true,
        maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
    },
    content: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung câu hỏi']
    },
    tags: {
        type: [String],
        validate: {
            validator: (arr) => arr.length <= 5,
            message: 'Tối đa 5 thẻ tag'
        },
        default: []
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    voters: [{
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        type: { type: String, enum: ['up', 'down'] }
    }],
    viewCount: {
        type: Number,
        default: 0
    },
    acceptedAnswer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
        default: null
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    closedReason: {
        type: String,
        default: ''
    },
    // Dành cho giảng viên / admin đánh dấu câu hỏi hay
    isPinned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual: đếm số câu trả lời
questionSchema.virtual('answersCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'question',
    count: true
});

// Virtual: danh sách câu trả lời
questionSchema.virtual('answers', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'question',
    justOne: false,
    match: { parentComment: null } // Chỉ lấy câu trả lời gốc, không phải reply
});

// Cập nhật updatedAt trước khi save
questionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Index tìm kiếm
questionSchema.index({ title: 'text', content: 'text' });
questionSchema.index({ tags: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ votes: -1 });

module.exports = mongoose.model('Question', questionSchema);
