const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();


connectDB();

const app = express();


app.use(express.json());


app.use(cors());



app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Q&A Forum API' });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
