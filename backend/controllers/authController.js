import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_safety_secret';

export const registerUser = async (req, res) => {
    const { name, email, password, role, division_id } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, role, division_id)
            Values ($1, $2, $3, $4, $5) RETURNING id, name, email, role, division_id`,
            [name, email, hashedPassword, role || 'user', division_id || null]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in registerUser controller' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                division_id: user.division_id
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in loginUser controller'})
    }
};

export const logoutUser = async (req, res) => {
  try {
    // Remove Cookie

    res.status(200).json({ 
      message: 'Logged out successfully. Please delete your token from storage.' 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error in logoutUser controller' });
  }
};