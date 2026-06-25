import pool from '../utils/db.js';

export const getDivisions = async (req, res) => {
    try {
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
        res.status(200).json({
            status: 'Success',
            results: result.rows.length,
            divisions: result.rows
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getDivisions controller' });
    }
};

export const getDivisionDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const queryText = `
            SELECT
                d.id,
                d.name,
                d.description,
                d.created_at,
                d.updated_at,
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
            WHERE d.id = $1
            GROUP BY d.id;
        `;

        const result = await pool.query(queryText, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Division not found' });
        }

        res.status(200).json({
            status: 'Success',
            division: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getDivisionDetails controller' });
    }
};

export const createDivision = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Division name is required' });
    }

    try {
        const divisionExists = await pool.query('SELECT * FROM divisions WHERE name = $1', [name]);
        if (divisionExists.rows.length > 0) {
            return res.status(400).json({ message: 'Division name is already exists' });
        }

        const queryText = `
            INSERT INTO divisions (name, description) 
            VALUES ($1, $2) 
            RETURNING *
        `;

        const newDivision = await pool.query(queryText, [name, description || null]);

        res.status (201).json({ 
            message: 'Division created successfully',
            division: newDivision.rows[0]
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in createDivision controller' });
    }
};

export const updateDivision = async (req, res) => {
    const { id } = req.params;
    const { name, description, add_user_ids, remove_user_ids } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Division name is required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updateDivisionQuery = `
            UPDATE divisions
            SET name = $1, description = $2, updated_at = NOW() 
            WHERE id = $3 
            RETURNING *
        `
        const divisionResult = await client.query(updateDivisionQuery,[
            name,
            description || null,
            id
        ]);

        if (divisionResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Division not found' });
        }

        let addedCount = 0;
        let removedCount = 0;

        if (add_user_ids && Array.isArray(add_user_ids) && add_user_ids.length > 0) {
            const addQuery = `
                UPDATE users 
                SET division_id = $1 
                WHERE id = ANY($2)
            `;
            const addResult = await client.query(addQuery, [id, add_user_ids]);
            addedCount = addResult.rowCount;
        }

        if (remove_user_ids && Array.isArray(remove_user_ids) && remove_user_ids.length > 0) {
            const removeQuery = `
                UPDATE users 
                SET division_id = NULL 
                WHERE id = ANY($1) AND division_id = $2
            `;
            const removeResult = await client.query(removeQuery, [remove_user_ids, id]);
            removedCount = removeResult.rowCount;
        }

        await client.query('COMMIT');

        let successMessage = 'Division updated successfully.';
        if (addedCount > 0 || removedCount > 0) {
            successMessage = `Division updated. Successfully added ${addedCount} members and remove ${removeCount} members.`
        }

        res.status(200).json({
            status: 'Success',
            message: successMessage,
            division: divisionResult.rows[0],
            stats: {
                added: addedCount,
                removed: removedCount
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error.message);
        res.status(500).json({ error: 'Error in updateDivision controller' });
    } finally {
        client.release();
    }
};

export const deleteDivision = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM divisions WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Division not found' });
        }

        res.status(200).json({
            message: 'Division deleted successfully',
            deletedDivision: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);

        if (error.code === '23503') {
            return res.status(400).json({ 
            message: 'Cannot delete division. It is currently assigned to one or more users. Please move or remove the members first.' 
        });
        }
        res.status(500).json({ error: 'Error in deleteDivision controller' });
    }
};