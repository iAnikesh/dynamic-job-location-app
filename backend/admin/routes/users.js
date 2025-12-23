// admin/routes/users.js
const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const User = require("../../models/User");
const router = express.Router();

// Get all users with filters
router.get("/", adminAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            role,
            status,
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = {};

        if (role) query.role = role;
        if (status === 'pending') query.isApproved = false;
        if (status === 'approved') query.isApproved = true;
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -resetOtp -resetOtpExpiry')
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit)),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// Get user by ID
router.get("/:id", adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -resetOtp -resetOtpExpiry');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Failed to fetch user" });
    }
});

// Approve user
router.put("/:id/approve", adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isApproved = true;
        user.approvedAt = new Date();
        user.approvedBy = req.admin.id;
        await user.save();

        // TODO: Send approval email to user

        res.json({
            message: "User approved successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        console.error("Approve user error:", error);
        res.status(500).json({ message: "Failed to approve user" });
    }
});

// Reject user
router.put("/:id/reject", adminAuth, async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isApproved = false;
        user.rejectionReason = reason;
        user.rejectedAt = new Date();
        user.rejectedBy = req.admin.id;
        await user.save();

        // TODO: Send rejection email to user

        res.json({
            message: "User rejected",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        console.error("Reject user error:", error);
        res.status(500).json({ message: "Failed to reject user" });
    }
});

// Suspend/Activate user
router.put("/:id/toggle-active", adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({ message: "Failed to update user status" });
    }
});

// Delete user (soft delete)
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Soft delete
        user.isActive = false;
        user.isDeleted = true;
        user.deletedAt = new Date();
        user.deletedBy = req.admin.id;
        await user.save();

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
});

// Get pending users count
router.get("/stats/pending", adminAuth, async (req, res) => {
    try {
        const pendingCount = await User.countDocuments({ isApproved: false });
        res.json({ count: pendingCount });
    } catch (error) {
        res.status(500).json({ message: "Failed to get pending count" });
    }
});

module.exports = router;