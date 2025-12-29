import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Edit,
    Trash2,
    AlertCircle,
    File,
    Video,
    Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Recruiter State
    const [postedJobs, setPostedJobs] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null); // For viewing applications
    const [jobApplications, setJobApplications] = useState([]);
    const [viewingApplication, setViewingApplication] = useState(null); // specific app details

    // Job Seeker State
    const [myApplications, setMyApplications] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            if (user?.role === 'recruiter') {
                const { data } = await axios.get('/api/jobs/my/posted');
                setPostedJobs(data.jobs);

                const interviewsRes = await axios.get('/api/applications/recruiter/interviews');
                setInterviews(interviewsRes.data.applications);
            } else if (user?.role === 'jobseeker') {
                const { data } = await axios.get('/api/applications/my');
                setMyApplications(data.applications);
            }
        } catch (error) {
            console.error('Fetch dashboard error:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplications = async (jobId) => {
        try {
            setSelectedJobId(jobId);
            setActiveTab('applications');
            const { data } = await axios.get(`/api/jobs/${jobId}/applications`);
            setJobApplications(data.applications);
        } catch (error) {
            toast.error('Failed to load applications');
        }
    };

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            await axios.put(`/api/applications/${applicationId}/status`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);

            // Update local state
            setJobApplications(prev => prev.map(app =>
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleWithdraw = async (applicationId) => {
        if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;

        try {
            await axios.put(`/api/applications/${applicationId}/withdraw`, { reason: 'User withdrawn' });
            toast.success('Application withdrawn successfully');

            // Update local state
            setMyApplications(prev => prev.map(app =>
                app._id === applicationId ? { ...app, status: 'withdrawn', isWithdrawn: true } : app
            ));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to withdraw application');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Welcome back, {user?.name || user?.username}
                        </p>
                    </div>

                    {user?.role === 'recruiter' && (
                        <Link
                            to="/post-job"
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <PlusIcon size={18} />
                            Post New Job
                        </Link>
                    )}
                </div>

                {/* RECRUITER VIEW */}
                {user?.role === 'recruiter' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar / Stats */}
                        <div className="space-y-6 lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <LayoutDashboard size={20} /> Overview
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <span className="text-gray-500 dark:text-gray-300">Active Jobs</span>
                                        <span className="font-bold text-lg">{postedJobs.filter(j => j.status === 'active').length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <span className="text-gray-500 dark:text-gray-300">Total Applications</span>
                                        <span className="font-bold text-lg">
                                            {postedJobs.reduce((acc, job) => acc + (job.applicationsCount || 0), 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* Tabs Header */}
                            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                                <button
                                    onClick={() => { setActiveTab('overview'); setSelectedJobId(null); }}
                                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview'
                                        ? 'border-black dark:border-white text-black dark:text-white'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Posted Jobs
                                </button>
                                <button
                                    onClick={() => { setActiveTab('interviews'); setSelectedJobId(null); }}
                                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'interviews'
                                        ? 'border-black dark:border-white text-black dark:text-white'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Interviews
                                </button>
                                {selectedJobId && (
                                    <button
                                        onClick={() => setActiveTab('applications')}
                                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'applications'
                                            ? 'border-black dark:border-white text-black dark:text-white'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        Applications
                                    </button>
                                )}
                            </div>

                            {activeTab === 'interviews' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-4">Scheduled Interviews</h2>
                                    {interviews.length === 0 ? (
                                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                            <Video className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                            <p className="text-gray-500">No interviews scheduled yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {interviews.map(app => (
                                                <div key={app._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold text-lg">{app.jobSeekerId?.name || 'Candidate'}</div>
                                                            <div className="text-gray-500 text-sm mb-2">Applied for: {app.jobId?.title}</div>

                                                            <div className="flex items-center gap-4 mt-3">
                                                                {app.interviews && app.interviews.length > 0 && app.interviews[app.interviews.length - 1].meetingLink ? (
                                                                    <a
                                                                        href={app.interviews[app.interviews.length - 1].meetingLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                                    >
                                                                        <Video size={16} />
                                                                        Join Google Meet
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-yellow-600 text-sm flex items-center gap-1">
                                                                        <AlertCircle size={14} /> Link pending
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    {app.interviews && app.interviews.length > 0 && app.interviews[app.interviews.length - 1].scheduledAt
                                                                        ? new Date(app.interviews[app.interviews.length - 1].scheduledAt).toLocaleString()
                                                                        : 'TBD'
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <StatusBadge status={app.status} />
                                                            <select
                                                                value={app.status}
                                                                onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                                                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                                                            >
                                                                <option value="interviewing">Interviewing</option>
                                                                <option value="offered">Offered</option>
                                                                <option value="rejected">Rejected</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'overview' && (
                                <div className="grid gap-4">
                                    {postedJobs.length === 0 ? (
                                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs posted yet</h3>
                                            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first job posting to get started.</p>
                                            <Link to="/post-job" className="text-blue-600 hover:underline">Post a Job</Link>
                                        </div>
                                    ) : (
                                        postedJobs.map(job => (
                                            <div key={job._id} className="bg-white dark:bg-gray-800 client-card p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-3">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {job.status.toUpperCase()}
                                                            </span>
                                                            <span>•</span>
                                                            <span>Posted {new Date(job.publishedAt || job.createdAt).toLocaleDateString()}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            to={`/edit-job/${job._id}`}
                                                            className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                                            title="Edit Job"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                        <Link
                                                            to={`/jobs/${job._id}`}
                                                            className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                                            title="View Job"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{job.viewsCount || 0}</div>
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Views</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold">{job.applicationsCount || 0}</div>
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Applications</div>
                                                    </div>
                                                    <div className="text-center flex items-center justify-center">
                                                        <button
                                                            onClick={() => handleViewApplications(job._id)}
                                                            className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                        >
                                                            View Applicants
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'applications' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <button onClick={() => setActiveTab('overview')} className="text-sm text-gray-500 hover:underline">
                                            &larr; Back to Jobs
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <h2 className="text-xl font-bold">
                                            Applications for {postedJobs.find(j => j._id === selectedJobId)?.title}
                                        </h2>
                                    </div>

                                    {jobApplications.length === 0 ? (
                                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                            <p className="text-gray-500">No applications received yet.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
                                                            <th className="p-4 font-medium">Applicant</th>
                                                            <th className="p-4 font-medium">Applied Date</th>
                                                            <th className="p-4 font-medium">Status</th>
                                                            <th className="p-4 font-medium">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {jobApplications.map(app => (
                                                            <tr key={app._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="p-4">
                                                                    <Link to={`/profile/${app.jobSeekerName}`} className="font-medium text-blue-600 hover:underline">
                                                                        {app.jobSeekerName}
                                                                    </Link>
                                                                    <div className="text-sm text-gray-500">{app.jobSeekerEmail}</div>
                                                                    {app.resume && (
                                                                        <a
                                                                            href={app.resume}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                                                        >
                                                                            <File size={12} /> View Resume
                                                                        </a>
                                                                    )}
                                                                </td>
                                                                <td className="p-4 text-sm text-gray-500">
                                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                                </td>
                                                                <td className="p-4">
                                                                    <StatusBadge status={app.status} />
                                                                </td>
                                                                <td className="p-4">
                                                                    <select
                                                                        value={app.status}
                                                                        onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                                                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                                                                        disabled={app.status === 'withdrawn'}
                                                                    >
                                                                        <option value="applied">Applied</option>
                                                                        <option value="viewed">Viewed</option>
                                                                        <option value="shortlisted">Shortlisted</option>
                                                                        <option value="interviewing">Interviewing</option>
                                                                        <option value="offered">Offered</option>
                                                                        <option value="rejected">Rejected</option>
                                                                    </select>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* JOB SEEKER VIEW */}
                {user?.role === 'jobseeker' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FileText size={24} /> My Applications
                            </h3>

                            {myApplications.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
                                    <Link to="/jobs" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium">
                                        Browse Jobs
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {myApplications.map(app => (
                                        <div key={app._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                <div>
                                                    <h4 className="text-lg font-bold">{app.jobId?.title || app.jobTitle}</h4>
                                                    <p className="text-gray-500 dark:text-gray-400">{app.companyName}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <MapPinIcon size={14} />
                                                            {app.jobId?.location?.city || 'Location N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            Applied {new Date(app.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {app.status === 'interviewing' && app.interviews && app.interviews.length > 0 && app.interviews[app.interviews.length - 1].meetingLink && (
                                                        <a
                                                            href={app.interviews[app.interviews.length - 1].meetingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                        >
                                                            <Video size={16} />
                                                            Join Interview
                                                        </a>
                                                    )}
                                                    <StatusBadge status={app.status} />

                                                    {['applied', 'viewed'].includes(app.status) && (
                                                        <button
                                                            onClick={() => handleWithdraw(app._id)}
                                                            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            Withdraw
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/jobs/${app.jobId?._id}`}
                                                        className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        View Job
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

// Helper Components
const StatusBadge = ({ status }) => {
    const styles = {
        applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        shortlisted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        interviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        offered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || styles.applied}`}>
            {status}
        </span>
    );
};

const PlusIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const MapPinIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

export default Dashboard;
