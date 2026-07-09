import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../utils/db.js';
import cookieOptions from '../utils/cookieHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_safety_secret';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const sanitizedEmail = email.toLowerCase().trim();
        
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [sanitizedEmail]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, role, division_id)
            Values ($1, $2, $3, $4, $5) RETURNING id, name, email, role, division_id`,
            [name, sanitizedEmail, hashedPassword, 'user', null]
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
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const sanitizedEmail = email.toLowerCase().trim();

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [sanitizedEmail]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (user.is_active === false) {
            return res.status(403).json({ 
                message: 'Your account is pending activation. Please contact the Admin.' 
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, cookieOptions);

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
        const { maxAge, ...clearOptions } = cookieOptions;

        res.clearCookie('token', clearOptions);

        res.status(200).json({ 
            message: 'Logged out successfully.' 
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in logoutUser controller' });
    }
};

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
        SELECT u.id, u.display_id, u.name, u.email, u.role, d.name AS division_name 
        FROM users u
        LEFT JOIN divisions d ON u.division_id = d.id
        WHERE u.id = $1
        `;
        const userResult = await pool.query(query, [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(userResult.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getMe controller' });
    }  
};