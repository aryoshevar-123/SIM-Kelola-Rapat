import pool from '../utils/db.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
    try {
        const queryText = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u.is_active,
                u.division_id,
                d.name AS division_name
            FROM users u
            LEFT JOIN divisions d ON u.division_id = d.id
            ORDER BY u.name ASC;
        `;
        const result = await pool.query(queryText);

        res.status(200).json({
            status: 'Success',
            results: result.rows.length,
            users: result.rows
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getUsers controller' });
    }
};

export const getUserDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u.is_active,
                u.division_id,
                d.name AS division_name
            FROM users u
            LEFT JOIN divisions d ON u.division_id = d.id
            WHERE u.id = $1;
        `;
        const result = await pool.query(queryText, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            status: 'Success',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getUserDetails controller' });
    }
};

export const createUserByAdmin = async (req, res) => {
    const { name, email, password, role, division_id } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
        const sanitizedEmail = email.toLowerCase().trim();

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [sanitizedEmail]);
        if (userExists.rowCount > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const queryText = `
            INSERT INTO users (name, email, password, role, division_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, name, email, role, division_id, is_active
        `;
        const newUser = await pool.query(queryText, [
            name, 
            sanitizedEmail, 
            hashedPassword, 
            role || 'user', 
            division_id || null, 
            true
        ]);

        res.status(201).json({
            message: 'User created successfully by Admin',
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in createUserByAdmin controller' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, role, division_id, is_active } = req.body;

    if (!name || !role || is_active === undefined) {
        return res.status(400).json({ message: 'Name, role, and activation status are required' });
    }

    try {
        const queryText = `
            UPDATE users 
            SET name = $1, role = $2, division_id = $3, is_active = $4, updated_at = NOW()
            WHERE id = $5 
            RETURNING id, name, email, role, division_id, is_active
        `;
        const result = await pool.query(queryText, [
            name, 
            role, 
            division_id || null, 
            is_active, 
            id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in updateUser controller' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            deletedUser: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: 'Cannot delete user. This user has operational history (e.g., booked meetings) in the system.' 
            });
        }
        res.status(500).json({ error: 'Error in deleteUser controller' });
    }
};