const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập, vui lòng đăng nhập' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
        }

        if (!req.user.isActive) {
            return res.status(403).json({ success: false, message: 'Tài khoản đã bị khoá' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token hết hạn hoặc không hợp lệ' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role "${req.user.role}" không có quyền thực hiện thao tác này. Yêu cầu: ${roles.join(', ')}`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
