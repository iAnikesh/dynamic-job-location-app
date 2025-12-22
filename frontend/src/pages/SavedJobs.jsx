import { useAuth } from '../context/AuthContext';
import { useSavedJobs } from '../hooks/useSavedJobs';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Clock, Building2, Bookmark, Calendar, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SavedJobs = () => {
    const { user } = useAuth();
    const { getSavedJobsList, getDaysUntilExpiration, unsaveJob } = useSavedJobs();
    const savedJobs = getSavedJobsList();

    const formatSalary = (salary) => {
        if (!salary?.min && !salary?.max) return 'Not disclosed';
        let curr = '₹';
        if (salary.currency === ' USD') {
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

    const handleUnsave = (e, jobId) => {
        e.preventDefault();
        e.stopPropagation();
        unsaveJob(jobId);
        toast.success('Job removed from saved jobs');
    };

    if (user?.role !== 'jobseeker') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Only job seekers can save jobs
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                        Saved Jobs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved • Expires in 60 days
                    </p>
                </div>

                {savedJobs.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Bookmark size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                            No Saved Jobs
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start saving jobs you're interested in to view them later
                        </p>
                        <Link
                            to="/jobs"
                            className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {savedJobs.map((job) => (
                            <Link
                                key={job._id}
                                to={`/jobs/${job._id}`}
                                className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-all hover:shadow-lg p-6 group relative"
                            >
                                <button
                                    onClick={(e) => handleUnsave(e, job._id)}
                                    className="absolute top-4 right-4 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors z-10"
                                    title="Remove from saved"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex gap-4 pr-12">
                                    <div className="flex-shrink-0">
                                        {job.companyLogo ? (
                                            <img
                                                src={job.companyLogo}
                                                alt={job.recruiterName}
                                                className="w-16 h-16 rounded-lg object-contain"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-colors group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                                                <Building2 size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-xl font-semibold text-black dark:text-white truncate">
                                                {job.title}
                                            </h3>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                                            {job.recruiterName}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={16} />
                                                {job.location?.city || 'Remote'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase size={16} />
                                                {job.jobType}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign size={16} />
                                                {formatSalary(job.salary)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={16} />
                                                {getTimeAgo(job.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Bookmark size={12} />
                                                Saved {getTimeAgo(job.savedAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                Expires in {getDaysUntilExpiration(job.savedAt)} days
                                            </span>
                                        </div>

                                        {job.skills && job.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {job.skills.slice(0, 5).map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills.length > 5 && (
                                                    <span className="px-3 py-1 text-xs font-medium text-gray-500">
                                                        +{job.skills.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedJobs;
