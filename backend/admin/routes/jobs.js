// admin/routes/jobs.js
const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const Job = require("../../models/Jobs");
const router = express.Router();

// Get all jobs with filters
router.get("/", adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (status === 'active') query.status = 'active';
    if (status === 'closed') query.status = 'closed';

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { recruiterName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiterId', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Get job by ID
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiterId', 'name email recruiterProfile');

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ message: "Failed to fetch job" });
  }
});

// Approve job
router.put("/:id/approve", adminAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isApproved = true;
    job.approvedAt = new Date();
    job.approvedBy = req.admin.id;
    job.status = 'active';
    await job.save();

    // TODO: Notify recruiter

    res.json({
      message: "Job approved successfully",
      job: {
        id: job._id,
        title: job.title,
        isApproved: job.isApproved,
        status: job.status
      }
    });
  } catch (error) {
    console.error("Approve job error:", error);
    res.status(500).json({ message: "Failed to approve job" });
  }
});

// Reject job
router.put("/:id/reject", adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isApproved = false;
    job.rejectionReason = reason;
    job.rejectedAt = new Date();
    job.rejectedBy = req.admin.id;
    job.status = 'draft';
    await job.save();

    // TODO: Notify recruiter

    res.json({
      message: "Job rejected",
      job: {
        id: job._id,
        title: job.title,
        isApproved: job.isApproved
      }
    });
  } catch (error) {
    console.error("Reject job error:", error);
    res.status(500).json({ message: "Failed to reject job" });
  }
});

// Delete job
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = 'closed';
    job.isActive = false;
    job.deletedAt = new Date();
    job.deletedBy = req.admin.id;
    await job.save();

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

// Toggle job active status
router.put("/:id/toggle-active", adminAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Toggle logic
    job.isActive = !job.isActive;

    // Sync status with active state if needed, but primary flag is isActive
    if (job.isActive && job.status === 'closed') {
      job.status = 'active';
    } else if (!job.isActive && job.status === 'active') {
      job.status = 'closed';
    }

    await job.save();

    res.json({
      message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`,
      job: {
        id: job._id,
        title: job.title,
        isActive: job.isActive,
        status: job.status
      }
    });
  } catch (error) {
    console.error("Toggle job status error:", error);
    res.status(500).json({ message: "Failed to update job status" });
  }
});

// Get pending jobs count
router.get("/stats/pending", adminAuth, async (req, res) => {
  try {
    const pendingCount = await Job.countDocuments({ isApproved: false });
    res.json({ count: pendingCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to get pending count" });
  }
});

module.exports = router;