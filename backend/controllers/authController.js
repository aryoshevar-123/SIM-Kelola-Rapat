import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import cookieOptions from '../utils/cookieHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_safety_secret';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

        const sanitizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: sanitizedEmail });
        if (userExists) return res.status(400).json({ message: 'Email already registered' });

        const newUser = await User.create({
            name,
            email: sanitizedEmail,
            password,
            role: 'user',
            divisionId: null
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error("Error in registerUser:", error.message);
        res.status(500).json({ error: 'Error in registerUser controller' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email or password' });

        const sanitizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: sanitizedEmail }, true);
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        if (user.is_active === false) {
            return res.status(403).json({ message: 'Your account is pending activation. Please contact the Admin.' });
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
            user: { id: user.id, name: user.name, email: user.email, role: user.role, division_id: user.division_id }
        });
    } catch (error) {
        console.error("Error in loginUser:", error.message);
        res.status(500).json({ error: 'Error in loginUser controller' });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const { maxAge, ...clearOptions } = cookieOptions;
        res.clearCookie('token', clearOptions);
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        console.error("Error in logoutUser:", error.message);
        res.status(500).json({ error: 'Error in logoutUser controller' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error("Error in getMe:", error.message);
        res.status(500).json({ error: 'Error in getMe controller' });
    }  
};