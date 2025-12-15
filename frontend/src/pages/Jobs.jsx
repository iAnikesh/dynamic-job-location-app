// frontend/src/pages/Jobs.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Briefcase, DollarSign, Clock, Building2, Filter, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        jobType: '',
        workMode: '',
        experienceLevel: '',
        page: 1
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, [filters.page]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });
            // Add default radius if lat/lng are present
            if (filters.lat && filters.lng && !filters.radius) {
                params.append('radius', '50');
            }

            const { data } = await axios.get(`/api/jobs?${params}`);
            setJobs(data.jobs);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Fetch jobs error:", error);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const [locationValue, setLocationValue] = useState(null);

    const handleLocationSelect = (val) => {
        setLocationValue(val);
        if (!val) {
            setFilters({ ...filters, location: '', lat: '', lng: '', page: 1 });
            return;
        }

        geocodeByAddress(val.label)
            .then(results => {
                return getLatLng(results[0]);
            })
            .then(({ lat, lng }) => {
                setFilters({
                    ...filters,
                    location: val.label,
                    lat,
                    lng,
                    page: 1
                });
                // Optional: trigger search immediately or wait for button click
            })
            .catch(error => console.error('Geocoding error:', error));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchJobs();
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            location: '',
            jobType: '',
            workMode: '',
            experienceLevel: '',
            page: 1
        });
        setTimeout(fetchJobs, 100);
    };

    const formatSalary = (salary) => {
        if (!salary?.min && !salary?.max) return 'Not disclosed';
        const min = salary.min ? `$${(salary.min / 1000).toFixed(0)}k` : '';
        const max = salary.max ? `$${(salary.max / 1000).toFixed(0)}k` : '';
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section with Search */}
            <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold text-center mb-2 text-black dark:text-white">
                        Find Your Dream Job
                    </h1>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                        Discover opportunities that match your skills and aspirations
                    </p>

                    {/* Search */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Job title, keywords, or company"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <div className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white focus-within:border-transparent outline-none">
                                    <GooglePlacesAutocomplete
                                        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                        selectProps={{
                                            value: locationValue,
                                            onChange: handleLocationSelect,
                                            placeholder: 'Location...',
                                            isClearable: true,
                                            styles: {
                                                control: (provided) => ({
                                                    ...provided,
                                                    borderRadius: '9999px',
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    backgroundColor: 'transparent',
                                                    paddingLeft: '30px', // Adjust for MapPin icon
                                                    paddingTop: '0.45rem', // py-3 equivalent
                                                    paddingBottom: '0.45rem', // py-3 equivalent
                                                    minHeight: 'auto', // Override default min-height
                                                }),
                                                input: (provided) => ({
                                                    ...provided,
                                                    color: 'inherit',
                                                    margin: '0', // Remove default margin
                                                    padding: '0', // Remove default padding
                                                }),
                                                singleValue: (provided) => ({
                                                    ...provided,
                                                    color: 'inherit',
                                                }),
                                                placeholder: (provided) => ({
                                                    ...provided,
                                                    color: '#9ca3af', // gray-400
                                                }),
                                                menu: (provided) => ({
                                                    ...provided,
                                                    zIndex: 50,
                                                    borderRadius: '0.75rem',
                                                    marginTop: '0.5rem',
                                                    backgroundColor: 'white', // Ensure menu background is visible
                                                    color: 'black', // Ensure text is visible
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    color: 'black',
                                                    backgroundColor: state.isFocused ? '#f3f4f6' : 'white', // gray-100
                                                    '&:active': {
                                                        backgroundColor: '#e5e7eb', // gray-200
                                                    },
                                                }),
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors whitespace-nowrap"
                            >
                                Search Jobs
                            </button>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors text-sm font-medium"
                        >
                            <Filter size={16} />
                            Filters
                        </button>
                        {(filters.jobType || filters.workMode || filters.experienceLevel) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                                <X size={16} />
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Job Type
                                </label>
                                <select
                                    value={filters.jobType}
                                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="full-time">Full Time</option>
                                    <option value="part-time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Work Mode
                                </label>
                                <select
                                    value={filters.workMode}
                                    onChange={(e) => handleFilterChange('workMode', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                                >
                                    <option value="">All Modes</option>
                                    <option value="onsite">Onsite</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Experience Level
                                </label>
                                <select
                                    value={filters.experienceLevel}
                                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                                >
                                    <option value="">All Levels</option>
                                    <option value="entry">Entry Level</option>
                                    <option value="junior">Junior</option>
                                    <option value="mid">Mid Level</option>
                                    <option value="senior">Senior</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => { fetchJobs(); setShowFilters(false); }}
                                className="px-6 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Jobs List */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20">
                        <Briefcase size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No jobs found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Try adjusting your filters or search criteria
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                Showing {jobs.length} of {pagination.total} jobs
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {jobs.map((job) => (
                                <Link
                                    key={job._id}
                                    to={`/jobs/${job._id}`}
                                    className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-all hover:shadow-lg p-6"
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            {job.companyLogo ? (
                                                <img
                                                    src={job.companyLogo}
                                                    alt={job.recruiterName}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    <Building2 size={32} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-semibold text-black dark:text-white mb-2 truncate">
                                                {job.title}
                                            </h3>
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

                                            {job.skills && job.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
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

                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    disabled={filters.page === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Page {filters.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    disabled={filters.page === pagination.pages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Jobs;