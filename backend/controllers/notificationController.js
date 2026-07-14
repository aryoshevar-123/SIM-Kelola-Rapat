import { Notification } from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const notifications = await Notification.findAllByUser(userId);
        const unreadCount = await Notification.countUnreadByUser(userId);

        res.status(200).json({ status: 'Success', unread_count: unreadCount, results: notifications.length, notifications });
    } catch (error) {
        console.error("Error in getNotifications Controller:", error.message);
        res.status(500).json({ error: 'Error in getNotifications controller.' });
    }
};

export const getNotificationDetails = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const notification = await Notification.findOne(id);
        if (!notification) return res.status(404).json({ message: 'Notification not found.' });

        if (notification.receiver_id && notification.receiver_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to view this notification details.' });
        }

        if (!notification.is_read) {
            await Notification.updateReadStatus(id, true);
            notification.is_read = true;
        }

        res.status(200).json({ status: 'Success', notification });
    } catch (error) {
        console.error("Error in getNotificationDetails Controller:", error.message);
        res.status(500).json({ error: 'Error in getNotificationDetails controller.' });
    }
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const notification = await Notification.findOne(id);
        if (!notification) return res.status(404).json({ message: 'Notification not found.' });
        if (notification.user_id !== userId) return res.status(403).json({ message: 'Unauthorized to update this notification.' });

        const updatedNotification = await Notification.updateReadStatus(id, true);
        res.status(200).json({ message: 'Notification marked as read', notification: updatedNotification });
    } catch (error) {
        console.error("Error in markAsRead Controller:", error.message);
        res.status(500).json({ error: 'Error in markAsRead controller.' });
    }
};

export const markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await Notification.markAllAsReadByUser(userId);
        res.status(200).json({ message: 'All notifications successfully marked as read' });
    } catch (error) {
        console.error("Error in markAllAsRead Controller:", error.message);
        res.status(500).json({ error: 'Error in markAllAsRead controller.' });
    }
};

export const deleteAllReadNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const deletedCount = await Notification.deleteReadByUser(userId);
        res.status(200).json({ message: `Successfully cleared ${deletedCount} read notifications.` });
    } catch (error) {
        console.error("Error in deleteAllReadNotifications Controller:", error.message);
        res.status(500).json({ error: 'Error in deleteAllReadNotifications controller.' });
    }
};