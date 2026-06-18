import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import pool from './utils/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('Server is ready');
});
app.get('/api/test-db', async (req,res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');

        res.json({
            status: "Success",
            message: "Backend is successfully communication with PostgreSQL!",
            db_time: result.rows[0].current_time
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: "Error", error: "Database connection failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});