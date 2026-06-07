const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập họ tên'],
        trim: true,
        maxlength: [100, 'Họ tên không được quá 100 ký tự']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: [6, 'Mật khẩu ít nhất 6 ký tự'],
        select: false 
    },
    role: {
        type: String,
        enum: {
            values: ['student', 'lecturer', 'moderator', 'admin'],
            message: 'Role không hợp lệ'
        },
        default: 'student'
    },
    faculty: {
        type: String,
        enum: [
            'Khoa Công nghệ Thông tin 1',
            'Khoa Công nghệ Thông tin 2',
            'Khoa Viễn thông 1',
            'Khoa Viễn thông 2',
            'Khoa Kỹ thuật Điện tử 1',
            'Khoa Kỹ thuật Điện tử 2',
            'Khoa Cơ bản 1',
            'Khoa Cơ bản 2',
            'Khoa Quản trị Kinh doanh',
            'Khoa Tài chính Kế toán',
            'Khoa Quốc tế và Đào tạo Sau đại học',
            'Khoa khác'
        ],
        default: 'Khoa Công nghệ Thông tin 1'
    },
    studentId: {
        type: String,
        trim: true,
        default: ''
    },
    bio: {
        type: String,
        maxlength: [300, 'Giới thiệu không quá 300 ký tự'],
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    reputation: {
        type: Number,
        default: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('postedQuestions', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'author',
    justOne: false
});

userSchema.virtual('postedAnswers', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'author',
    justOne: false
});

userSchema.virtual('postedQuestionsCount', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'author',
    count: true
});

userSchema.virtual('postedAnswersCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'author',
    count: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre('save', function () {
    if (!this.avatar || this.avatar.includes('T%E1%BA%ADp_tin:Logo_PTIT') || this.avatar.includes('portal.ptit.edu.vn') || this.avatar.includes('wikimedia.org') || this.avatar.startsWith('data:image/png;base64')) {
        this.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name || 'U')}&backgroundColor=1890ff&textColor=ffffff`;
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getRoleDisplay = function () {
    const roleMap = {
        student: 'Sinh viên',
        lecturer: 'Giảng viên',
        moderator: 'Kiểm duyệt viên',
        admin: 'Quản trị viên'
    };
    return roleMap[this.role] || 'Sinh viên';
};

userSchema.index({ role: 1 });
userSchema.index({ faculty: 1 });

module.exports = mongoose.model('User', userSchema);
