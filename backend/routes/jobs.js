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
      applicationUrl,
      benefits,
      responsibilities,
      qualifications,
      isUrgent
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
      industry: Array.isArray(industry) ? industry : (industry ? [industry] : []),
      category,
      experienceRequired,
      experienceLevel,
      educationRequired,
      skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()),
      salary,
      location,
      openings: openings || 1,
      applicationDeadline,
      applicationUrl,
      benefits: Array.isArray(benefits) ? benefits : [],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      publishedAt: new Date(),
      status: 'active',
      isUrgent: isUrgent || false,
      isApproved: false,
      status: 'draft'
    });

    await job.save();

    // Notify matching job seekers
    try {
      console.log('🔍 Checking for matching users. Job Industry:', job.industry);
      if (job.industry && job.industry.length > 0) {
        // Find users who have subscribed to these industries
        const matchingUsers = await User.find({
          role: 'jobseeker',
          'jobSeekerProfile.industries': { $in: job.industry.map(i => new RegExp(`^${i}$`, 'i')) }
        });

        console.log(`found ${matchingUsers.length} matching users`);

        const Notification = require('../models/Notifications');

        const notifications = matchingUsers.map(user => ({
          userId: user._id,
          type: 'new_job_match',
          title: 'New Job Match',
          message: `A new job "${job.title}" in ${job.industry.join(', ')} has been posted.`,
          relatedJobId: job._id,
          actionUrl: `/jobs/${job._id}`
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
          console.log('✅ Notifications saved to DB');

          // Emit real-time events
          matchingUsers.forEach(user => {
            console.log(`📡 Emitting 'notification' to room: ${user._id.toString()}`);
            req.io.to(user._id.toString()).emit('notification', {
              type: 'new_job_match',
              title: 'New Job Match',
              message: `A new job "${job.title}" has been posted.`,
              jobId: job._id
            });
          });
        }
      }

      // Notify nearby users if Urgent
      if (job.isUrgent && job.location && job.location.coordinates) {
        console.log('🚨 Urgent Job! Search for nearby users...');
        const nearbyUsers = await User.find({
          role: 'jobseeker',
          'location.coordinates': {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: job.location.coordinates
              },
              $maxDistance: 20000 // 20km
            }
          }
        });

        console.log(`found ${nearbyUsers.length} nearby users for urgent job`);

        const Notification = require('../models/Notifications');
        const urgentNotifications = nearbyUsers.map(user => ({
          userId: user._id,
          type: 'urgent_job_alert',
          title: '🚨 Urgent Job Nearby!',
          message: `URGENT: ${job.title} is hiring near you!`,
          relatedJobId: job._id,
          actionUrl: `/jobs/${job._id}`
        }));

        if (urgentNotifications.length > 0) {
          await Notification.insertMany(urgentNotifications);

          // Emit real-time events
          nearbyUsers.forEach(user => {
            req.io.to(user._id.toString()).emit('notification', {
              type: 'urgent_job_alert',
              title: '🚨 Urgent Job Nearby!',
              message: `URGENT: ${job.title} is hiring near you!`,
              jobId: job._id
            });
          });
        }
      }
    } catch (notifyError) {
      console.error("Notification error:", notifyError);
      // Don't fail the request if notification fails
    }

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
      order = 'desc',
      isUrgent,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Common Match Query (for non-geo fields)
    const matchQuery = { status: 'active', isActive: true, isApproved: true };

    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (jobType) matchQuery.jobType = jobType;
    if (workMode) matchQuery.workMode = workMode;
    if (experienceLevel) matchQuery.experienceLevel = experienceLevel;
    if (isUrgent === 'true') matchQuery.isUrgent = true;

    if (industry) {
      const industries = industry.split(',').map(i => i.trim()).filter(Boolean);
      if (industries.length > 0) {
        matchQuery.industry = {
          $in: industries.map(ind => new RegExp(`^${ind}$`, 'i'))
        };
      }
    }

    if (salaryMin || salaryMax) {
      matchQuery['salary.min'] = {};
      if (salaryMin) matchQuery['salary.min'].$gte = Number(salaryMin);
      if (salaryMax) matchQuery['salary.max'].$lte = Number(salaryMax);
    }

    let jobs = [];
    let total = 0;

    // CHECK IF GEO-SEARCH IS REQUIRED
    if (lat && lng) {
      // Use Aggregation Pipeline for GeoNear
      const pipeline = [];

      // 1. $geoNear (Must be first)
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          distanceField: "dist.calculated", // Output field for distance
          maxDistance: (Number(radius) || 50) * 1000, // Convert km to meters
          spherical: true,
          query: matchQuery, // Apply filters as part of the geo query where possible
          includeLocs: "dist.location"
        }
      });

      // 2. Additional Sort (if not sorting by distance, which is default for geoNear)
      // Note: geoNear sorts by distance by default. If user wants other sort, we append it.
      if (sortBy !== 'distance') {
        const sortStage = {};
        sortStage[sortBy] = order === 'desc' ? -1 : 1;
        pipeline.push({ $sort: sortStage });
      }

      // 3. Facet for Pagination and Total Count
      pipeline.push({
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limitNum }]
        }
      });

      const result = await Job.aggregate(pipeline);

      jobs = result[0].data;
      total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    } else {
      // Standard Find Query
      if (location) {
        matchQuery.$or = [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.state': { $regex: location, $options: 'i' } },
          { 'location.country': { $regex: location, $options: 'i' } }
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;

      [jobs, total] = await Promise.all([
        Job.find(matchQuery)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .select('-__v'),
        Job.countDocuments(matchQuery)
      ]);
    }

    res.json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
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

    if (!job.isApproved && (!req.user || req.user.id !== job.recruiterId.toString())) {
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

    if (updates.title || updates.description || updates.requirements) {
  job.isApproved = false;
  job.status = 'draft';
  // Notify admin of changes
}

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

    // if (!user.isApproved) {
    //   return res.status(403).json({ 
    //   message: "Your account is pending admin approval. Please wait for verification." 
    // });
    // }

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

    // Check Industry Constraint
    if (job.industry && job.industry.length > 0) {
      const userIndustries = jobSeeker.jobSeekerProfile.industries || [];

      const hasMatchingIndustry = userIndustries.some(uInd =>
        job.industry.some(jInd => jInd.toLowerCase().trim() === uInd.toLowerCase().trim())
      );

      if (!hasMatchingIndustry) {
        return res.status(403).json({
          message: `This job requires one of the following industries: ${job.industry.join(', ')}. You can only apply to jobs matching your profile industries.`
        });
      }
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