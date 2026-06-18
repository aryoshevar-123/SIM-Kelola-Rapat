import pool from "../utils/db";

export const getRooms = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rooms ORDER BY name ASC');
    
        res.status(200).json({
            status: 'Success',
            results: result.rows.length,
            rooms: result.rows
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getRooms controller' });
    }
};

export const getRoomDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({
            status: 'Success',
            room: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getRoomDetails controller' });
    }
};

export const createRoom = async (req, res) => {
    const { name, capacity, location_details } = req.body;

    if (!name || !capacity) {
        return res.status(400).json({ message: 'Room name and capacity are required' });
    }

    try {
        const roomExists = await pool.query('SELECT * FROM rooms WHERE name = $1', [name]);
        if (roomExists.rowCount > 0) {
            return res.status(400).json({ message: 'Room name already exists' });
        }

        const queryText = `
            INSERT INTO rooms (name, capacity, location_details) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const newRoom = await pool.query(queryText, [name, capacity, location_details || null]);

        res.status(201).json({
            message: 'Room created successfully',
            room: newRoom.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in createRoom controller' });
    }
};

export const updateRoom = async (req, res) => {
    const { id } = req.params;
    const { name, capacity, description } = req.body;

    if (!name || !capacity) {
        return res.status(400).json({ message: 'Room name and capacity are required' });
    }

    try {
        const queryText = `
            UPDATE rooms 
            SET name = $1, capacity = $2, description = $3, updated_at = NOW() 
            WHERE id = $4 
            RETURNING *
        `;
        const result = await pool.query(queryText, [name, capacity, description || null, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({
            message: 'Room updated successfully',
            room: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in updateRoom controller' });
    }
};

export const deleteRoom = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({
            message: 'Room deleted successfully',
            deletedRoom: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
    
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: 'Cannot delete room. It is currently booked for one or more meetings.' 
            });
        }
        res.status(500).json({ error: 'Error in deleteRoom controller' });
    }
};