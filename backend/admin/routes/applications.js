// admin/routes/applications.js
const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const Application = require("../../models/Applications");
const router = express.Router();

// Get all applications with filters
router.get("/", adminAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            sortBy = 'appliedAt',
            order = 'desc'
        } = req.query;

        const query = {};

        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        const [applications, total] = await Promise.all([
            Application.find(query)
                .populate('jobSeekerId', 'name email username')
                .populate('jobId', 'title location jobType')
                .populate({
                    path: 'jobId',
                    populate: {
                        path: 'recruiterId',
                        select: 'recruiterProfile.companyName'
                    }
                })
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit)),
            Application.countDocuments(query)
        ]);

        res.json({
            applications,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error("Get applications error:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
});

// Get application by ID
router.get("/:id", adminAuth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('jobSeekerId', 'name email username phone jobSeekerProfile')
            .populate('jobId', 'title description location jobType salaryMin salaryMax')
            .populate({
                path: 'jobId',
                populate: {
                    path: 'recruiterId',
                    select: 'recruiterProfile'
                }
            });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json({ application });
    } catch (error) {
        console.error("Get application error:", error);
        res.status(500).json({ message: "Failed to fetch application" });
    }
});

// Get application statistics
router.get("/stats/overview", adminAuth, async (req, res) => {
    try {
        const [total, byStatus] = await Promise.all([
            Application.countDocuments(),
            Application.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.json({
            total,
            byStatus
        });
    } catch (error) {
        console.error("Get application stats error:", error);
        res.status(500).json({ message: "Failed to get application statistics" });
    }
});

module.exports = router;
