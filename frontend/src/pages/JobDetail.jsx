// frontend/src/pages/JobDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MapPin, Briefcase, DollarSign, Clock, Building2, Users, ArrowLeft, Check, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: ''
  });

  useEffect(() => {
    fetchJob();
    if (user?.role === 'jobseeker') {
      checkApplicationStatus();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`/api/jobs/${id}`);
      setJob(data.job);
    } catch (error) {
      console.error("Fetch job error:", error);
      toast.error("Failed to load job details");
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const { data } = await axios.get(`/api/applications/check/${id}`);
      setHasApplied(data.hasApplied);
    } catch (error) {
      console.error("Check application error:", error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login to apply");
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (user.role !== 'jobseeker') {
      toast.error("Only job seekers can apply");
      return;
    }

    setApplying(true);
    try {
      await axios.post(`/api/jobs/${id}/apply`, applicationData);
      toast.success("Application submitted successfully!");
      setHasApplied(true);
      setShowApplyModal(false);
    } catch (error) {
      console.error("Apply error:", error);
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return 'Not disclosed';
    const min = salary.min ? `$${(salary.min / 1000).toFixed(0)}k` : '';
    const max = salary.max ? `$${(salary.max / 1000).toFixed(0)}k` : '';
    return `${min}${min && max ? ' - ' : ''}${max} per ${salary.period || 'year'}`;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-shrink-0">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.recruiterName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Building2 size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                    {job.title}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {job.recruiterName}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {job.location?.city}, {job.location?.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={16} />
                      {job.jobType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      Posted {getTimeAgo(job.publishedAt)}
                    </span>
                    {job.applicationsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {job.applicationsCount} applicants
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                Job Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex gap-2 text-gray-600 dark:text-gray-400">
                      <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                  Qualifications
                </h2>
                <ul className="space-y-2">
                  {job.qualifications.map((item, index) => (
                    <li key={index} className="flex gap-2 text-gray-600 dark:text-gray-400">
                      <Star size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                  Benefits
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-black dark:text-white mb-2">
                  {formatSalary(job.salary)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {job.experienceLevel && (
                    <p>Experience: {job.experienceLevel}</p>
                  )}
                  {job.workMode && (
                    <p>Work Mode: {job.workMode}</p>
                  )}
                </div>
              </div>

              {user?.role === 'jobseeker' && (
                <>
                  {hasApplied ? (
                    <button
                      disabled
                      className="w-full py-3 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      Already Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      Apply Now
                    </button>
                  )}
                </>
              )}

              {!user && (
                <Link
                  to="/login"
                  state={{ from: `/jobs/${id}` }}
                  className="block w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Login to Apply
                </Link>
              )}

              {user?.role === 'recruiter' && (
                <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  You are logged in as a recruiter
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-black dark:text-white mb-4">
                Job Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Job Type</p>
                  <p className="font-medium text-black dark:text-white">{job.jobType}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Industry</p>
                  <p className="font-medium text-black dark:text-white">{job.industry || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Openings</p>
                  <p className="font-medium text-black dark:text-white">{job.openings}</p>
                </div>
                {job.applicationDeadline && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                    <p className="font-medium text-black dark:text-white">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                Apply for {job.title}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Cover Letter
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="Tell us why you're a great fit..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Expected Salary (Optional)
                  </label>
                  <input
                    type="number"
                    value={applicationData.expectedSalary}
                    onChange={(e) => setApplicationData({ ...applicationData, expectedSalary: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;