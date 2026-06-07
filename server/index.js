const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/questions', require('./routes/questions'));

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: 'PTIT Q&A Forum API',
        version: '1.0.0',
        endpoints: {
            auth:      '/api/auth',
            users:     '/api/users',
            questions: '/api/questions'
        }
    });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại` });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Lỗi server không xác định'
    });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
