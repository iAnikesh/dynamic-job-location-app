// admin-frontend/src/pages/Jobs.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, CheckCircle, XCircle, MapPin, Calendar, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';

const formatLocation = (loc) => {
    if (!loc) return 'N/A';
    if (typeof loc === 'string') return loc;

    const parts = [];
    if (loc.address) parts.push(loc.address);
    if (loc.city) parts.push(loc.city);
    if (loc.state) parts.push(loc.state);
    if (loc.country) parts.push(loc.country);

    const addressStr = parts.join(', ');
    if (loc.isRemote) {
        return addressStr ? `Remote (${addressStr})` : 'Remote';
    }
    return addressStr || 'N/A';
};

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        type: '',
        page: 1
    });
    const [pagination, setPagination] = useState({});
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, [filters.page, filters.status, filters.type]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });

            const { data } = await axios.get(`/api/admin/jobs?${params}`);
            setJobs(data.jobs);
            setPagination(data.pagination);
        } catch (error) {
            toast.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchJobs();
    };

    const handleApprove = async (jobId) => {
        if (!confirm('Approve this job posting?')) return;

        try {
            await axios.put(`/api/admin/jobs/${jobId}/approve`);
            toast.success('Job approved successfully');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to approve job');
        }
    };

    const handleReject = async (jobId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await axios.put(`/api/admin/jobs/${jobId}/reject`, { reason });
            toast.success('Job rejected');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to reject job');
        }
    };

    const handleToggleActive = async (jobId) => {
        try {
            await axios.put(`/api/admin/jobs/${jobId}/toggle-active`);
            toast.success('Job status updated');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const viewJobDetails = async (jobId) => {
        try {
            const { data } = await axios.get(`/api/admin/jobs/${jobId}`);
            setSelectedJob(data.job);
            setShowModal(true);
        } catch (error) {
            toast.error('Failed to load job details');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Review and manage job postings</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                        <option value="">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>

                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Jobs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {jobs.map((job) => (
                                        <tr key={job._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                        <MapPin size={12} />
                                                        {formatLocation(job.location)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {job.recruiter?.recruiterProfile?.companyName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full capitalize bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                    {job.jobType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    {!job.isApproved ? (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 w-fit">
                                                            Pending
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 w-fit">
                                                            Approved
                                                        </span>
                                                    )}
                                                    {job.isActive ? (
                                                        <span className="text-xs text-green-600">Active</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">Inactive</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => viewJobDetails(job._id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {!job.isApproved && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(job._id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(job._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {job.isApproved && (
                                                        <button
                                                            onClick={() => handleToggleActive(job._id)}
                                                            className={`p-2 rounded-lg ${job.isActive
                                                                ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                                }`}
                                                            title={job.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {job.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                        disabled={filters.page === 1}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                        disabled={filters.page === pagination.pages}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Job Details Modal */}
            {showModal && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Job Details</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedJob.title}</h4>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedJob.recruiter?.recruiterProfile?.companyName}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Location</label>
                                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                        <MapPin size={16} />
                                        {formatLocation(selectedJob.location)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Job Type</label>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedJob.jobType}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Salary Range</label>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        ${selectedJob.salaryMin?.toLocaleString()} - ${selectedJob.salaryMax?.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Experience Level</label>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedJob.experienceLevel}</p>
                                </div>
                            </div>

                            {selectedJob.industries && selectedJob.industries.length > 0 && (
                                <div>
                                    <label className="text-sm text-gray-500">Industries</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedJob.industries.map((industry, i) => (
                                            <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                                                {industry}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 && (
                                <div>
                                    <label className="text-sm text-gray-500">Required Skills</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedJob.requiredSkills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-gray-500">Description</label>
                                <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                                    {selectedJob.description}
                                </p>
                            </div>

                            {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                                <div>
                                    <label className="text-sm text-gray-500">Responsibilities</label>
                                    <ul className="list-disc list-inside text-gray-900 dark:text-white mt-1 space-y-1">
                                        {selectedJob.responsibilities.map((resp, i) => (
                                            <li key={i}>{resp}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                <div>
                                    <label className="text-sm text-gray-500">Requirements</label>
                                    <ul className="list-disc list-inside text-gray-900 dark:text-white mt-1 space-y-1">
                                        {selectedJob.requirements.map((req, i) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
