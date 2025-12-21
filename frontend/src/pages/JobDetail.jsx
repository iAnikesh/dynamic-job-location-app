// frontend/src/pages/JobDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MapPin, Briefcase, DollarSign, Clock, Building2, Users, ArrowLeft, Check, Star, Share2, AlertTriangle, ExternalLink, Hash, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

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
  }, [id, user]);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Job link copied to clipboard!");
  };

  const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return 'Not disclosed';
    let curr = '₹';
    if (salary.currency === 'USD') {
      curr = '$';
    } else if (salary.currency === 'EUR') {
      curr = '€';
    } else if (salary.currency === 'GBP') {
      curr = '£';
    }
    const min = salary.min ? `${curr}${(salary.min / 1000).toFixed(0)}k` : '';
    const max = salary.max ? `${curr}${(salary.max / 1000).toFixed(0)}k` : '';
    return `${min}${min && max ? ' - ' : ''}${max}`;
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

  const isInternational = user?.location?.country && job?.location?.country &&
    user.location.country.toLowerCase().trim() !== job.location.country.toLowerCase().trim();

  const userIndustries = user?.jobSeekerProfile?.industries || [];
  const jobIndustries = job?.industry || [];

  // Check if ANY of the user's industries match ANY of the job's industries
  const isIndustryMatch = jobIndustries.length === 0 || (
    userIndustries.length > 0 &&
    userIndustries.some(uInd => jobIndustries.some(jInd => uInd.toLowerCase().trim() === jInd.toLowerCase().trim()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white mb-6 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back to Jobs
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.recruiterName}
                  className="w-24 h-24 rounded-xl object-contain border border-gray-100 dark:border-gray-700 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <Building2 size={40} className="text-gray-400 dark:text-gray-300" />
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-black dark:text-white mb-2 leading-tight">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-lg">{job.recruiterName}</span>
                    <span className="hidden md:inline text-gray-300 dark:text-gray-600">•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-gray-400" />
                      {job.location?.city}, {job.location?.country}
                    </span>
                    <span className="hidden md:inline text-gray-300 dark:text-gray-600">•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} className="text-gray-400" />
                      {getTimeAgo(job.publishedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    title="Share Job"
                  >
                    <Share2 size={20} />
                  </button>
                  {user?.role === 'jobseeker' && (
                    !hasApplied ? (
                      job.applicationUrl ? (
                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                        >
                          Apply Externally <ExternalLink size={18} />
                        </a>
                      ) : (
                        <button
                          onClick={() => setShowApplyModal(true)}
                          disabled={!isIndustryMatch}
                          className={`px-8 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 ${isIndustryMatch
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          Apply Now
                        </button>
                      )
                    ) : (
                      <button
                        disabled
                        className="px-8 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg font-medium flex items-center gap-2 cursor-default"
                      >
                        <Check size={20} />
                        Applied
                      </button>
                    )
                  )}
                  {!user && (
                    <Link
                      to="/login"
                      state={{ from: `/jobs/${id}` }}
                      className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg"
                    >
                      Login to Apply
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Warnings/Alerts */}
            {user?.role === 'jobseeker' && (
              <div className="space-y-4">
                {isInternational && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-4 flex gap-3 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold mb-1">International Application</h4>
                      <p className="text-sm opacity-90">
                        This job is located in {job.location?.country}, while you are based in {user.location?.country}. Please ensure you have the necessary work authorization.
                      </p>
                    </div>
                  </div>
                )}

                {!isIndustryMatch && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex gap-3 text-red-800 dark:text-red-200">
                    <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold mb-1">Industry Mismatch</h4>
                      <p className="text-sm opacity-90">
                        This job is in the <strong>{(job.industry || []).join(', ')}</strong> industry, which does not match your profile industries. You cannot apply to this role.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                <Briefcase size={22} className="text-blue-500" />
                Job Description
              </h2>
              <div
                className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
              />
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                  <Check size={22} className="text-green-500" />
                  Key Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex gap-3 text-gray-600 dark:text-gray-300 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                  <Star size={22} className="text-yellow-500" />
                  Qualifications
                </h2>
                <ul className="space-y-3">
                  {job.qualifications.map((item, index) => (
                    <li key={index} className="flex gap-3 text-gray-600 dark:text-gray-300 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Metadata Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm sticky top-6">
              <h3 className="font-bold text-lg text-black dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                Job Overview
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Salary</p>
                    <p className="font-semibold text-black dark:text-white text-lg">{formatSalary(job.salary)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Job Type</p>
                    <p className="font-semibold text-black dark:text-white capitalize">{job.jobType}</p>
                    <p className="text-sm text-gray-500 capitalize">{job.workMode}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                    <Hash size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Industry</p>
                    <p className="font-semibold text-black dark:text-white">{(job.industry && job.industry.length > 0) ? job.industry.join(', ') : 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                    <p className="font-semibold text-black dark:text-white capitalize">{job.experienceLevel}</p>
                    {job.experienceRequired && (
                      <p className="text-sm text-gray-500">
                        {job.experienceRequired.min} - {job.experienceRequired.max || '+'} years
                      </p>
                    )}
                  </div>
                </div>

                {job.applicationDeadline && (
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Deadline</p>
                      <p className="font-semibold text-black dark:text-white">
                        {new Date(job.applicationDeadline).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recruiter Section */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h4 className="font-semibold text-black dark:text-white mb-4">About the Company</h4>
                <div className="flex items-center gap-3 mb-4">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.recruiterName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Building2 size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-black dark:text-white text-sm">{job.recruiterName}</p>
                    <p className="text-xs text-gray-500">Recruiter</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="font-semibold text-black dark:text-white mb-4">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skills Card */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="font-bold text-lg text-black dark:text-white mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user?.role === 'recruiter' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                  You are viewing this job as a recruiter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Apply for {job.title}
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Cover Letter
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                >
                  {applying ? 'Submitting...' : 'Submit Assessment'}
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