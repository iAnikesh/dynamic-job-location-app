// admin/routes/analytics.js
const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const User = require("../../models/User");
const Job = require("../../models/Jobs");
const Application = require("../../models/Applications");
const router = express.Router();

// Get dashboard stats
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalJobSeekers,
      totalRecruiters,
      pendingUsers,
      activeUsers,
      totalJobs,
      activeJobs,
      pendingJobs,
      totalApplications,
      recentApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ isApproved: false }),
      User.countDocuments({ isActive: true }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ isApproved: false }),
      Application.countDocuments(),
      Application.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    // User growth (last 30 days)
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Job postings (last 30 days)
    const jobPostings = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Top industries
    const topIndustries = await Job.aggregate([
      { $unwind: "$industry" },
      {
        $group: {
          _id: "$industry",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          jobSeekers: totalJobSeekers,
          recruiters: totalRecruiters,
          pending: pendingUsers,
          active: activeUsers
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          pending: pendingJobs
        },
        applications: {
          total: totalApplications,
          recent: recentApplications
        }
      },
      charts: {
        userGrowth,
        jobPostings,
        applicationsByStatus,
        topIndustries
      }
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// Get user analytics
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    const usersByStatus = await User.aggregate([
      {
        $group: {
          _id: {
            approved: "$isApproved",
            active: "$isActive"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const registrationTrend = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    res.json({
      usersByRole,
      usersByStatus,
      registrationTrend
    });
  } catch (error) {
    console.error("Get user analytics error:", error);
    res.status(500).json({ message: "Failed to fetch user analytics" });
  }
});

// Get job analytics
router.get("/jobs", adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const jobsByType = await Job.aggregate([
      {
        $group: {
          _id: "$jobType",
          count: { $sum: 1 }
        }
      }
    ]);

    const jobsByStatus = await Job.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const jobPostingTrend = await Job.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topRecruiters = await Job.aggregate([
      {
        $group: {
          _id: "$recruiterId",
          jobCount: { $sum: 1 },
          recruiterName: { $first: "$recruiterName" }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      jobsByType,
      jobsByStatus,
      jobPostingTrend,
      topRecruiters
    });
  } catch (error) {
    console.error("Get job analytics error:", error);
    res.status(500).json({ message: "Failed to fetch job analytics" });
  }
});

module.exports = router;