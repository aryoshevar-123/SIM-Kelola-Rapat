import pool from "../utils/db";

export const getNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        const queryText = `
            SELECT id, title, message, is_read, created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(queryText, [userId]);

        const unreadCountResult = await pool.query(
            'SELECT COUNT(*)::int AS unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        res.status(200).json({
            status: 'Success',
            unread_count: unreadCountResult.rows[0].unread_count,
            results: result.rowCount,
            notifications: result.rows
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getNotifications controller.' });
    }
};

export const getNotificationDetails = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const queryText = `
            SELECT 
                n.id, 
                n.type, 
                n.is_read, 
                n.created_at,
                n.sender_id,
                u.name AS sender_name,
                u.email AS sender_email
            FROM notifications n
            LEFT JOIN users u ON n.sender_id = u.id
            WHERE n.id = $1;
        `;
        const result = await pool.query(queryText, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        const notification = result.rows[0];

        if (notification.receiver_id && notification.receiver_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to view this notification details.' });
        }

        if (!notification.is_read) {
            await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
            notification.is_read = true;
        }

        res.status(200).json({
            status: 'Success',
            notification
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getNotificationDetails controller.' });
    }
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const notifCheck = await pool.query('SELECT user_id FROM notifications WHERE id = $1', [id]);
        
        if (notifCheck.rowCount === 0) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        if (notifCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this notification.' });
        }

        const queryText = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1
            RETURNING *;
        `;
        const result = await pool.query(queryText, [id]);

        res.status(200).json({
            message: 'Notification marked as read',
            notification: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in markAsRead controller.' });
    }
};

export const markAllAsRead = async (req, res) => {
    const userId = req.user.id;

    try {
        const queryText = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1 AND is_read = FALSE;
        `;
        await pool.query(queryText, [userId]);

        res.status(200).json({
            message: 'All notifications successfully marked as read'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in markAllAsRead controller.' });
    }
};

export const deleteAllReadNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        const queryText = `
            DELETE FROM notifications
            WHERE receiver_id = $1 AND is_read = TRUE;
        `;
        const result = await pool.query(queryText, [userId]);

        res.status(200).json({
            message: `Successfully cleared ${result.rowCount} read notifications from your inbox.`
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in deleteAllReadNotifications controller.' });
    }
};