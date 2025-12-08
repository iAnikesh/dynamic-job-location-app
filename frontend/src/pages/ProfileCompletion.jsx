import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Briefcase, Award, Building2, Globe, Users, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProfileCompletion = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        phone: user?.phone || '',
        location: '', // City
        // Job Seeker
        experienceLevel: 'entry',
        industry: '',
        skills: '', // Comma separated for input, array for submit
        bio: '',
        // Recruiter
        companyName: '',
        companyWebsite: '',
        companySize: '',
        companyDescription: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formattedData = { ...formData };

            // Format skills if job seeker
            if (user.role === 'jobseeker') {
                formattedData.skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
            }

            const { data } = await axios.put('/api/user/profile', formattedData);

            updateUser(data.user);
            toast.success('Profile completed successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Complete Your Profile</h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Tell us more about yourself to get started as a {user.role === 'jobseeker' ? 'Job Seeker' : 'Recruiter'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Location (City)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder="New York, NY"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Job Seeker Specific */}
                        {user.role === 'jobseeker' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Experience Level</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Award className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                name="experienceLevel"
                                                value={formData.experienceLevel}
                                                onChange={handleChange}
                                                className="input-field pl-10 appearance-none"
                                            >
                                                <option value="entry">Entry Level</option>
                                                <option value="junior">Junior</option>
                                                <option value="mid">Mid Level</option>
                                                <option value="senior">Senior</option>
                                                <option value="expert">Expert</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Industry</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="industry"
                                                required
                                                value={formData.industry}
                                                onChange={handleChange}
                                                className="input-field pl-10"
                                                placeholder="Software, Finance, etc."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Skills (Comma separated)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            name="skills"
                                            required
                                            value={formData.skills}
                                            onChange={handleChange}
                                            className="input-field pl-10 min-h-[80px]"
                                            placeholder="React, Node.js, Python, SQL"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="input-field min-h-[100px]"
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Recruiter Specific */}
                        {user.role === 'recruiter' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building2 className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="companyName"
                                            required
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Website (Optional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Globe className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="url"
                                                name="companyWebsite"
                                                value={formData.companyWebsite}
                                                onChange={handleChange}
                                                className="input-field pl-10"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company Size</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Users className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="companySize"
                                                value={formData.companySize}
                                                onChange={handleChange}
                                                className="input-field pl-10"
                                                placeholder="e.g. 50-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company Description</label>
                                    <textarea
                                        name="companyDescription"
                                        required
                                        value={formData.companyDescription}
                                        onChange={handleChange}
                                        className="input-field min-h-[100px]"
                                        placeholder="What does your company do?"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Complete Profile'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletion;
