const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
    try {
        const { name, email, password, role, faculty } = req.body;

        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        
        const user = await User.create({
            name,
            email,
            password,
            role,
            faculty
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};
