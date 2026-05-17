const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    tags: [String],
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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


questionSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'question',
    justOne: false
});

module.exports = mongoose.model('Question', questionSchema);
