const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use('/api/auth', require('./routes/auth'));

app.use('/api/users', require('./routes/users'));

app.use('/api/questions', require('./routes/questions'));

app.use('/api/admin', require('./routes/admin'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/', (req, res) => {
    res.json({
        message: 'PTIT Q&A Forum API - Nhóm 13',
        version: '1.0.0',
        endpoints: {
            auth:      '/api/auth',
            users:     '/api/users',
            questions: '/api/questions'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại` });
});

app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Lỗi server không xác định'
    });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
