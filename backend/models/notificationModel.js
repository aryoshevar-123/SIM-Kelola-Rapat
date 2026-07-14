import pool from "../utils/db.js";

export const Notification = {
    findAllByUser: async (userId) => {
        const queryText = `
            SELECT id, title, message, is_read, created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(queryText, [userId]);
        return result.rows;
    },

    countUnreadByUser: async (userId) => {
        const queryText = 'SELECT COUNT(*)::int AS unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE';
        const result = await pool.query(queryText, [userId]);
        return result.rows[0].unread_count;
    },
    
    findOne: async (id) => {
        const queryText = `
            SELECT 
                n.id, n.type, n.is_read, n.created_at, n.sender_id, n.user_id, n.receiver_id,
                u.name AS sender_name,
                u.email AS sender_email
            FROM notifications n
            LEFT JOIN users u ON n.sender_id = u.id
            WHERE n.id = $1;
        `;
        const result = await pool.query(queryText, [id]);
        return result.rows[0];
    },

    updateReadStatus: async (id, isRead) => {
        const queryText = `
            UPDATE notifications
            SET is_read = $1
            WHERE id = $2
            RETURNING *;
        `;
        const result = await pool.query(queryText, [isRead, id]);
        return result.rows[0];
    },

    markAllAsReadByUser: async (userId) => {
        const queryText = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1 AND is_read = FALSE;
        `;
        const result = await pool.query(queryText, [userId]);
        return result.rowCount;
    },

    deleteReadByUser: async (userId) => {
        const queryText = `
            DELETE FROM notifications
            WHERE receiver_id = $1 AND is_read = TRUE;
        `;
        const result = await pool.query(queryText, [userId]);
        return result.rowCount;
    },

    createMass: async (client, { senderId, receiverIds, type, message = '' }) => {
        const queryText = `
            INSERT INTO notifications (sender_id, receiver_id, type, message)
            SELECT $1::int, unnest($2::int[]), $3::varchar, $4::text;
        `;
        await client.query(queryText, [senderId, receiverIds, type, message]);
    }
};