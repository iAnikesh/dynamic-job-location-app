// backend/routes/jobs.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const Job = require("../models/Jobs");
const User = require("../models/User");
const Application = require("../models/Applications");
const router = express.Router();

// Create a new job posting (Recruiter only)
router.post("/create", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    const recruiter = await User.findById(req.user.id);
    if (!recruiter.profileComplete) {
      return res.status(400).json({
        message: "Please complete your profile before posting jobs"
      });
    }

    const {
      title,
      description,
      jobType,
      workMode,
      industry,
      category,
      experienceRequired,
      experienceLevel,
      educationRequired,
      skills,
      salary,
      location,
      openings,
      applicationDeadline,
      benefits,
      responsibilities,
      qualifications
    } = req.body;

    // Validation
    if (!title || !description || !jobType || !location?.city) {
      return res.status(400).json({
        message: "Title, description, job type, and location are required"
      });
    }

    const job = new Job({
      title,
      description,
      recruiterId: req.user.id,
      recruiterName: recruiter.recruiterProfile.companyName || recruiter.name,
      companyLogo: recruiter.recruiterProfile.companyLogo,
      jobType,
      workMode,
      industry: industry || recruiter.recruiterProfile.industry,
      category,
      experienceRequired,
      experienceLevel,
      educationRequired,
      skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()),
      salary,
      location,
      openings: openings || 1,
      applicationDeadline,
      benefits: Array.isArray(benefits) ? benefits : [],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      publishedAt: new Date(),
      status: 'active'
    });

    await job.save();

    res.status(201).json({
      message: "Job posted successfully",
      job
    });
  } catch (error) {
    console.error("Job creation error:", error);
    res.status(500).json({
      message: "Failed to create job",
      error: error.message
    });
  }
});

// Get all jobs (with filters and pagination)
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      lat,
      lng,
      radius,
      jobType,
      workMode,
      experienceLevel,
      industry,
      salaryMin,
      salaryMax,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { status: 'active', isActive: true };

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Location filter
    if (lat && lng) {
      query['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [
            [Number(lng), Number(lat)],
            (Number(radius) || 50) / 6378.1 // radius in radians (km / earth radius)
          ]
        }
      };
    } else if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Work mode filter
    if (workMode) {
      query.workMode = workMode;
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Industry filter
    if (industry) {
      query.industry = industry;
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      query['salary.min'] = {};
      if (salaryMin) query['salary.min'].$gte = Number(salaryMin);
      if (salaryMax) query['salary.max'].$lte = Number(salaryMax);
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .select('-__v'),
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
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
});

// Get single job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiterId', 'name email recruiterProfile');

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Increment views count
    job.viewsCount += 1;
    await job.save();

    res.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({
      message: "Failed to fetch job",
      error: error.message
    });
  }
});

// Update job (Recruiter only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can update jobs" });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        job[key] = updates[key];
      }
    });

    await job.save();

    res.json({
      message: "Job updated successfully",
      job
    });
  } catch (error) {
    console.error("Job update error:", error);
    res.status(500).json({
      message: "Failed to update job",
      error: error.message
    });
  }
});

// Delete/Close job (Recruiter only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can delete jobs" });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    job.status = 'closed';
    job.isActive = false;
    job.closedAt = new Date();
    await job.save();

    res.json({ message: "Job closed successfully" });
  } catch (error) {
    console.error("Job delete error:", error);
    res.status(500).json({
      message: "Failed to delete job",
      error: error.message
    });
  }
});

// Get jobs posted by logged-in recruiter
router.get("/my/posted", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can access this" });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { recruiterId: req.user.id };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get posted jobs error:", error);
    res.status(500).json({
      message: "Failed to fetch posted jobs",
      error: error.message
    });
  }
});

// Apply for a job (Job Seeker only)
router.post("/:id/apply", auth, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can apply" });
    }

    const jobSeeker = await User.findById(req.user.id);
    if (!jobSeeker.profileComplete) {
      return res.status(400).json({
        message: "Please complete your profile before applying"
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: "This job is no longer active" });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId: req.params.id,
      jobSeekerId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    const { coverLetter, expectedSalary } = req.body;

    const application = new Application({
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.recruiterName,
      jobSeekerId: req.user.id,
      jobSeekerName: jobSeeker.name || jobSeeker.username,
      jobSeekerEmail: jobSeeker.email,
      recruiterId: job.recruiterId,
      resume: jobSeeker.jobSeekerProfile.resume?.url,
      coverLetter,
      expectedSalary,
      status: 'applied',
      statusHistory: [{
        status: 'applied',
        changedBy: req.user.id,
        changedAt: new Date()
      }]
    });

    await application.save();

    // Update job applications count
    job.applicationsCount += 1;
    await job.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    console.error("Application error:", error);
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message
    });
  }
});

// Get applications for a job (Recruiter only)
router.get("/:id/applications", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can view applications" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const applications = await Application.find({ jobId: req.params.id })
      .populate('jobSeekerId', 'name email jobSeekerProfile')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message
    });
  }
});

module.exports = router;