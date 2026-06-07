const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, targetModel, getTargetId) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function (body) {
            res.send = originalSend;

            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const targetId = getTargetId ? getTargetId(req) : null;
                    const log = new ActivityLog({
                        action,
                        user: req.user._id,
                        targetId,
                        targetModel,
                        details: `IP: ${req.ip}`
                    });
                    log.save().catch(err => console.error('Lỗi khi ghi ActivityLog:', err));
                } catch (error) {
                    console.error('Lỗi khi tạo ActivityLog instance:', error);
                }
            }

            return res.send(body);
        };
        next();
    };
};

module.exports = { logActivity };
