import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import pool from './utils/db.js';

import authRoutes from './routes/authRoutes.js';
import divisionRoutes from './routes/divisionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/divisions', divisionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});