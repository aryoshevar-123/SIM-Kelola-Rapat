import { Room } from "../models/roomModel.js";
import { Meeting } from "../models/meetingModel.js";
import pool from "../utils/db.js";

export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll();
        const occupiedRoomIds = await Meeting.findOccupiedRoomIds();
        
        const roomsWithStatus = rooms.map(room => ({
            ...room,
            status: occupiedRoomIds.includes(room.id) ? 'Sibuk' : 'Tersedia'
        }));

        res.status(200).json({ status: 'Success', results: roomsWithStatus.length, rooms: roomsWithStatus });
    } catch (error) {
        console.error("Error in getRooms Controller:", error.message);
        res.status(500).json({ error: 'Error in getRooms controller' });
    }
};

export const getRoomDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const room = await Room.findOne({ id });
        if (!room) return res.status(404).json({ message: 'Room not found' });

        const occupiedRoomIds = await Meeting.findOccupiedRoomIds();
        const meetingDetails = await Meeting.findDetailsByRoom(id);

        const comprehensiveRoomData = {
            ...room,
            status: occupiedRoomIds.includes(room.id) ? 'Sibuk' : 'Tersedia',
            today_meetings_count: meetingDetails.today_meetings_count,
            meetings: meetingDetails.meetings_list
        };

        res.status(200).json({ status: 'Success', room: comprehensiveRoomData });
    } catch (error) {
        console.error("Error in getRoomDetails Controller:", error.message);
        res.status(500).json({ error: 'Error in getRoomDetails controller' });
    }
};

export const getRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const room = await Room.findOne({ id });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.status(200).json({ status: 'Success', room });
    } catch (error) {
        console.error("Error in getRoomById Controller:", error.message);
        res.status(500).json({ error: 'Error in getRoomById controller' });
    }
};

export const createRoom = async (req, res) => {
    const { name, capacity, location_details } = req.body;
    if (!name || !capacity) return res.status(400).json({ message: 'Room name and capacity are required' });

    try {
        const result = await Room.create({ name, capacity, location_details });
        if (!result.success && result.type === 'ALREADY_EXISTS') return res.status(400).json({ message: 'Room name already exists' });

        res.status(201).json({ message: 'Room created successfully', room: result.room });
    } catch (error) {
        console.error("Error in createRoom:", error.message);
        res.status(500).json({ error: 'Error in createRoom controller' });
    }
};

export const updateRoom = async (req, res) => {
    const { id } = req.params;
    const { name, capacity, location_details } = req.body;
    if (!name || !capacity) return res.status(400).json({ message: 'Room name and capacity are required' });

    try {
        const updatedRoom = await Room.update(id, { name, capacity, location_details });
        if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
        res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
    } catch (error) {
        console.error("Error in updateRoom:", error.message);
        res.status(500).json({ error: 'Error in updateRoom controller' });
    }
};

export const deleteRoom = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const futureMeetingsCount = await Meeting.countFutureByRoom(client, id);
        if (futureMeetingsCount > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Tidak dapat menghapus ruangan. Masih terdapat ${futureMeetingsCount} agenda rapat mendatang.` });
        }

        await Meeting.detachPastByRoom(client, id);
        const deletedRoom = await Room.deleteRaw(client, id);
        if (!deletedRoom) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Ruangan tidak ditemukan.' });
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Ruangan berhasil dihapus secara permanen.', deletedRoom });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error in deleteRoom:", error.message);
        res.status(500).json({ error: 'Internal Server Error pada penghapusan ruangan' });
    } finally {
        client.release();
    }
};