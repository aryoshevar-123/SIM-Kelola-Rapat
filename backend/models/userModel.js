import pool from '../utils/db.js';
import bcrypt from 'bcryptjs';

export const User = {
    findAll: async (statusFilter) => {
        let queryText = `
            SELECT 
                u.id, u.display_id, u.name, u.email, u.role, u.division_id, u.is_active, u.profile_picture, u.created_at, u.updated_at,
                d.name AS division_name
            FROM users u
            LEFT JOIN divisions d ON u.division_id = d.id
        `;
        const queryParams = [];

        if (statusFilter === 'active') {
            queryText += ' WHERE u.is_active = TRUE';
        } else if (statusFilter === 'inactive') {
            queryText += ' WHERE u.is_active = FALSE';
        }

        queryText += ' ORDER BY u.name ASC;';

        const result = await pool.query(queryText, queryParams);
        return result.rows; 
    },

    findOne: async (criteria, includePassword = false) => {
        let queryText = `
            SELECT u.*, d.name AS division_name 
            FROM users u 
            LEFT JOIN divisions d ON u.division_id = d.id 
            WHERE 
        `;
        const values = [];

        if (criteria.id !== undefined) {
            queryText += 'u.id = $1;';
            values.push(criteria.id);
        } else if (criteria.email !== undefined) {
            queryText += 'u.email = $1;';
            values.push(criteria.email);
        } else {
            return null;
        }

        const result = await pool.query(queryText, values);
        const user = result.rows[0];

        if (user && !includePassword) {
            delete user.password;
        }

        return user;
    },

    create: async ({ name, email, password, role, divisionId }) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const queryText = `
            INSERT INTO users (name, email, password, role, division_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, name, email, role, division_id, is_active, profile_picture;
        `;
        
        const result = await pool.query(queryText, [
            name,
            email.toLowerCase().trim(),
            hashedPassword,
            role || 'user',
            divisionId || null,
            true
        ]);
        
        return result.rows[0];
    },

    update: async (id, fieldsToUpdate) => {
        const fields = [];
        const values = [];
        let idx = 1;

        if (fieldsToUpdate.password !== undefined && fieldsToUpdate.password !== null) {
            const salt = await bcrypt.genSalt(10);
            fieldsToUpdate.password = await bcrypt.hash(fieldsToUpdate.password, salt);
        }

        const columnMapping = {
            name: 'name',
            email: 'email',
            role: 'role',
            divisionId: 'division_id',
            isActive: 'is_active',
            password: 'password',
            profilePicture: 'profile_picture'
        };

        for (const [key, value] of Object.entries(fieldsToUpdate)) {
            if (columnMapping[key] !== undefined && value !== undefined) {
                fields.push(`${columnMapping[key]} = $${idx++}`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;

        values.push(id); 
        
        const queryText = `
            UPDATE users 
            SET ${fields.join(', ')}, updated_at = NOW() 
            WHERE id = $${idx} 
            RETURNING id, name, email, role, division_id, is_active, profile_picture, created_at, updated_at;
        `;

        const result = await pool.query(queryText, values);
        return result.rows[0];
    },

    delete: async (id) => {
        const user = await User.findOne({ id });
        if (!user) return { success: false, type: 'NOT_FOUND' };
        if (user.is_active) return { success: false, type: 'IS_ACTIVE' };

        try {
            const deleteResult = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);
            return { success: true, deletedUser: deleteResult.rows[0] };
        } catch (error) {
            if (error.code === '23503') return { success: false, type: 'OPERATIONAL_HISTORY' };
            throw error;
        }
    }
};