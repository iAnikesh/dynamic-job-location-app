// backend/routes/applications.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const Application = require("../models/Applications");
const Job = require("../models/Jobs");
const { createMeeting } = require("../utils/googleMeet");
const sendEmail = require("../utils/sendEmail");
const { getInterviewEmailTemplate } = require("../utils/emailTemplates");
const router = express.Router();

// Check if user has applied to a job
router.get("/check/:jobId", auth, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.json({ hasApplied: false });
    }

    const application = await Application.findOne({
      jobId: req.params.jobId,
      jobSeekerId: req.user.id
    });

    res.json({ hasApplied: !!application });
  } catch (error) {
    console.error("Check application error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all applications for logged-in job seeker
router.get("/my", auth, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can view applications" });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { jobSeekerId: req.user.id };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('jobId', 'title location status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(query)
    ]);

    res.json({
      applications,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// Get all interviews for logged-in recruiter
router.get("/recruiter/interviews", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can view interviews" });
    }

    const applications = await Application.find({
      recruiterId: req.user.id,
      status: 'interviewing'
    })
      .populate('jobId', 'title')
      .populate('jobSeekerId', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error("Get interviews error:", error);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
});

// Update application status (Recruiter only)
router.put("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can update status" });
    }

    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user.id,
      changedAt: new Date(),
      note
    });

    if (status === 'viewed' && !application.viewedAt) {
      application.viewedAt = new Date();
    }

    // Generate Google Meet link if moving to interviewing
    if (status === 'interviewing') {
      try {
        const meetingLink = await createMeeting();
        application.interviews.push({
          type: 'video',
          meetingLink,
          status: 'scheduled',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24h from now
        });

        // Send Email Notification
        const emailSubject = `Invitation to Interview: ${application.jobTitle}`;
        const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Same as above

        const emailHtml = getInterviewEmailTemplate(
          application.jobSeekerName,
          application.jobTitle,
          application.companyName,
          meetingLink,
          scheduledDate
        );

        await sendEmail(application.jobSeekerEmail, emailSubject, emailHtml);

      } catch (meetError) {
        console.error("Failed to generate meeting link:", meetError);
        // We continue nicely, recruiter might see no link and can handle it manually if needed
      }
    }

    await application.save();

    // Notify Job Seeker
    try {
      const Notification = require('../models/Notifications');

      let title = 'Application Update';
      let message = `Your application for ${application.jobTitle} has been updated to ${status}.`;

      if (status === 'shortlisted') {
        title = 'Congratulations! You are Shortlisted';
        message = `Good news! You have been shortlisted for ${application.jobTitle}.`;
      } else if (status === 'rejected') {
        title = 'Application Update';
        message = `Update regarding your application for ${application.jobTitle}.`;
      } else if (status === 'hired') {
        title = 'You are Hired!';
        message = `Congratulations! You have been hired for ${application.jobTitle}.`;
      }

      await Notification.create({
        userId: application.jobSeekerId,
        type: 'application_update',
        title,
        message,
        relatedApplicationId: application._id,
        relatedJobId: application.jobId,
        actionUrl: `/applications`
      });

      req.io.to(application.jobSeekerId.toString()).emit('notification', {
        type: 'application_update',
        title,
        message,
        applicationId: application._id
      });

    } catch (notifyError) {
      console.error("Notification error:", notifyError);
    }

    res.json({
      message: "Status updated successfully",
      application
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// Withdraw application (Job Seeker only)
router.put("/:id/withdraw", auth, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can withdraw" });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.jobSeekerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!['applied', 'viewed'].includes(application.status)) {
      return res.status(400).json({ message: "Cannot withdraw application at this stage" });
    }

    application.status = 'withdrawn';
    application.isWithdrawn = true;
    application.withdrawnAt = new Date();
    application.withdrawnReason = req.body.reason;

    application.statusHistory.push({
      status: 'withdrawn',
      changedBy: req.user.id,
      changedAt: new Date(),
      note: req.body.reason
    });

    await application.save();

    // Decrement job applications count
    await Job.findByIdAndUpdate(application.jobId, {
      $inc: { applicationsCount: -1 }
    });

    res.json({
      message: "Application withdrawn successfully",
      application
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ message: "Failed to withdraw application" });
  }
});

// Add recruiter note
router.post("/:id/notes", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can add notes" });
    }

    const { note } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.recruiterNotes.push({
      note,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    await application.save();

    res.json({
      message: "Note added successfully",
      application
    });
  } catch (error) {
    console.error("Add note error:", error);
    res.status(500).json({ message: "Failed to add note" });
  }
});

// Get single application details
router.get("/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('jobSeekerId', 'name email jobSeekerProfile')
      .populate('recruiterId', 'name recruiterProfile');

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check authorization
    if (
      application.jobSeekerId._id.toString() !== req.user.id &&
      application.recruiterId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ application });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
});

module.exports = router;