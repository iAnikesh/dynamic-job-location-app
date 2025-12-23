// admin-frontend/src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Briefcase, FileText } from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get(`/api/admin/analytics/detailed?days=${timeRange}`);
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                    <p className="text-gray-600 dark:text-gray-400">Detailed insights and trends</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                ${analytics?.revenue?.total?.toLocaleString() || 0}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {analytics?.users?.active || 0}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {analytics?.jobs?.active || 0}
                            </p>
                        </div>
                        <Briefcase className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {analytics?.applications?.total || 0}
                            </p>
                        </div>
                        <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        User Registration Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.charts?.userGrowth || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="New Users" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Job Postings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Job Postings
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.charts?.jobPostings || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#10B981" name="Jobs Posted" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Applications Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Applications Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.charts?.applications || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} name="Applications" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Industries */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Popular Industries
                    </h3>
                    <div className="space-y-3">
                        {(analytics?.charts?.topIndustries || []).slice(0, 10).map((industry, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                                    {industry._id || 'Unknown'}
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{
                                                width: `${(industry.count / (analytics?.charts?.topIndustries[0]?.count || 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                                        {industry.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        User Distribution
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Job Seekers</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {analytics?.users?.jobSeekers || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Recruiters</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {analytics?.users?.recruiters || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Pending Approval</span>
                            <span className="font-semibold text-orange-600">
                                {analytics?.users?.pending || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Job Statistics
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Active Jobs</span>
                            <span className="font-semibold text-green-600">
                                {analytics?.jobs?.active || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Inactive Jobs</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {analytics?.jobs?.inactive || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Pending Approval</span>
                            <span className="font-semibold text-orange-600">
                                {analytics?.jobs?.pending || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Application Status
                    </h3>
                    <div className="space-y-3">
                        {(analytics?.charts?.applicationsByStatus || []).map((status, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400 capitalize">{status._id}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {status.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
