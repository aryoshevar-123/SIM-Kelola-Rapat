import pool from "../utils/db.js";

export const Room = {
    // 🔍 Mengambil murni data fisik seluruh ruangan
    findAll: async () => {
        const queryText = `SELECT id, display_id, name, capacity, location_details, created_at, updated_at FROM rooms ORDER BY name ASC;`;
        const result = await pool.query(queryText);
        return result.rows;
    },

    // 🎯 Cari satu ruangan berdasarkan kriteria fisik tunggal (id atau name)
    findOne: async (criteria) => {
        let queryText = `SELECT id, display_id, name, capacity, location_details, created_at, updated_at FROM rooms WHERE `;
        const values = [];

        if (criteria.id !== undefined) {
            queryText += 'id = $1;';
            values.push(criteria.id);
        } else if (criteria.name !== undefined) {
            queryText += 'name = $1;';
            values.push(criteria.name);
        } else {
            return null;
        }

        const result = await pool.query(queryText, values);
        return result.rows[0];
    },

    // ➕ Tambah Ruangan Baru
    create: async ({ name, capacity, location_details }) => {
        const roomExists = await Room.findOne({ name });
        if (roomExists) return { success: false, type: 'ALREADY_EXISTS' };

        const queryText = `INSERT INTO rooms (name, capacity, location_details) VALUES ($1, $2, $3) RETURNING *;`;
        const result = await pool.query(queryText, [name, capacity, location_details || null]);
        return { success: true, room: result.rows[0] };
    },

    // ✏️ Perbarui Informasi Ruangan
    update: async (id, { name, capacity, location_details }) => {
        const queryText = `UPDATE rooms SET name = $1, capacity = $2, location_details = $3, updated_at = NOW() WHERE id = $4 RETURNING *;`;
        const result = await pool.query(queryText, [name, capacity, location_details || null, id]);
        return result.rows[0];
    },

    // 🗑️ Eksekusi Hapus Fisik Ruangan (Menerima Klien Transaksi eksternal)
    deleteRaw: async (client, id) => {
        const queryText = `DELETE FROM rooms WHERE id = $1 RETURNING *;`;
        const result = await client.query(queryText, [id]);
        return result.rows[0];
    }
};