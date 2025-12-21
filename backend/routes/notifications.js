const express = require("express");
const auth = require("../middleware/authMiddleware");
const Notification = require("../models/Notifications");
const router = express.Router();

// Get user notifications
router.get("/", auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            isRead: false
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.json({ message: "Marked as read", notification });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ message: "Failed to update notification" });
    }
});

// Mark all as read
router.put("/read-all", auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        res.json({ message: "All marked as read" });
    } catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({ message: "Failed to update notifications" });
    }
});

module.exports = router;
