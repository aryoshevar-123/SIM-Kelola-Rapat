import pool from '../utils/db.js';

export const Division = {
    findAll: async () => {
        const queryText = `
            SELECT
                d.*,
                COUNT(u.id)::int AS total_members
            FROM divisions d
            LEFT JOIN users u ON d.id = u.division_id
            GROUP BY d.id
            ORDER BY d.name ASC;
        `;
        const result = await pool.query(queryText);
        return result.rows;
    },

    findOne: async (criteria, includeMembers = false) => {
        let queryText = '';
        const values = [];

        if (includeMembers) {
            queryText = `
                SELECT
                    d.id, d.name, d.description, d.created_at, d.updated_at,
                    COUNT(u.id)::int AS total_members,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', u.id,
                                'name', u.name,
                                'email', u.email,
                                'role', u.role,
                                'profile_picture', u.profile_picture
                            )
                        ) FILTER (WHERE u.id IS NOT NULL), '[]'
                    ) AS members
                FROM divisions d
                LEFT JOIN users u ON d.id = u.division_id
                WHERE 
            `;
        } else {
            queryText = `SELECT d.* FROM divisions d WHERE `;
        }

        if (criteria.id !== undefined) {
            queryText += includeMembers ? 'd.id = $1 GROUP BY d.id;' : 'd.id = $1;';
            values.push(criteria.id);
        } else if (criteria.name !== undefined) {
            queryText += includeMembers ? 'd.name = $1 GROUP BY d.id;' : 'd.name = $1;';
            values.push(criteria.name);
        } else {
            return null;
        }

        const result = await pool.query(queryText, values);
        return result.rows[0];
    },

    create: async ({ name, description, employeeIds }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const divisionExists = await Division.findOne({ name });
            if (divisionExists) {
                await client.query('ROLLBACK');
                return { success: false, type: 'ALREADY_EXISTS' };
            }

            const insertDivisionQuery = `
                INSERT INTO divisions (name, description) 
                VALUES ($1, $2) 
                RETURNING *;
            `;
            const newDivisionResult = await client.query(insertDivisionQuery, [name, description || null]);
            const newDivision = newDivisionResult.rows[0];

            if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
                const updateUsersQuery = `
                    UPDATE users 
                    SET division_id = $1, updated_at = NOW() 
                    WHERE id = ANY($2::int[]);
                `;
                await client.query(updateUsersQuery, [newDivision.id, employeeIds]);
            }

            await client.query('COMMIT');
            return { success: true, division: newDivision };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    update: async (id, { name, description, addUserIds, removeUserIds }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const updateDivisionQuery = `
                UPDATE divisions
                SET name = $1, description = $2, updated_at = NOW() 
                WHERE id = $3 
                RETURNING *;
            `;
            const divisionResult = await client.query(updateDivisionQuery, [name, description || null, id]);

            if (divisionResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return { success: false, type: 'NOT_FOUND' };
            }

            let addedCount = 0;
            let removedCount = 0;

            if (addUserIds && Array.isArray(addUserIds) && addUserIds.length > 0) {
                const addQuery = 'UPDATE users SET division_id = $1 WHERE id = ANY($2::int[])';
                const addResult = await client.query(addQuery, [id, addUserIds]);
                addedCount = addResult.rowCount;
            }

            if (removeUserIds && Array.isArray(removeUserIds) && removeUserIds.length > 0) {
                const removeQuery = 'UPDATE users SET division_id = NULL WHERE id = ANY($1::int[]) AND division_id = $2';
                const removeResult = await client.query(removeQuery, [removeUserIds, id]);
                removedCount = removeResult.rowCount;
            }

            await client.query('COMMIT');
            return { 
                success: true, 
                division: divisionResult.rows[0], 
                stats: { added: addedCount, removed: removedCount } 
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    delete: async (id) => {
        try {
            const result = await pool.query('DELETE FROM divisions WHERE id = $1 RETURNING *', [id]);
            if (result.rowCount === 0) return { success: false, type: 'NOT_FOUND' };
            return { success: true, deletedDivision: result.rows[0] };
        } catch (error) {
            if (error.code === '23503') return { success: false, type: 'ASSIGNED_TO_USERS' };
            throw error;
        }
    }
};