const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const questionRoutes = require('./routes/questionRoutes');
const authRoutes = require('./routes/authRoutes');


dotenv.config();


connectDB();

const app = express();


app.use(express.json());


app.use(cors());


app.use('/api/questions', questionRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Q&A Forum API' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
