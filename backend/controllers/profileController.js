import pool from '../utils/db.js';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary } from '../utils/cloudinaryHelper.js';

export const getMyProfile = async (req, res) => {
    try {
        const queryText = `
            SELECT u.id, u.name, u.email, u.role, u.profile_picture, d.name AS division_name
            FROM users u
            LEFT JOIN divisions d ON u.division_id = d.id
            WHERE u.id = $1;
        `;
        const result = await pool.query(queryText, [req.user.id]);

        res.status(200).json({
            status: 'Success',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getMyProfile controller' });
    }
};

export const updateMyProfile = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        const sanitizedEmail = email.toLowerCase().trim();

        const emailCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND id != $2', 
            [sanitizedEmail, req.user.id]
        );
        if (emailCheck.rowCount > 0) {
            return res.status(400).json({ message: 'Email is already taken by another user' });
        }

        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, 'sim_kelola_rapat/profiles');
        } else {
            const currentProfile = await pool.query('SELECT profile_picture FROM users WHERE id = $1', [req.user.id]);
            imageUrl = currentProfile.rows[0].profile_picture;
        }

        const queryText = `
            UPDATE users 
            SET name = $1, email = $2, profile_picture = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING id, name, email, role, profile_picture
        `;
        const result = await pool.query(queryText, [
            name, 
            sanitizedEmail, 
            imageUrl, 
            req.user.id
        ]);

        res.status(200).json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in updateMyProfile controller' });
    }
};

export const updateMyPassword = async (req, res) => {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    try {
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(new_password, salt);

        await pool.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
            [hashedNewPassword, req.user.id]
        );

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in updateMyPassword controller' });
    }
};