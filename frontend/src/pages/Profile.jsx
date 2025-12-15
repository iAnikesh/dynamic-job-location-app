import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, GraduationCap, Link as LinkIcon, Mail, Phone, Calendar, User as UserIcon, Edit2 } from 'lucide-react';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get(`/api/user/profile/${username}`);
                setProfileUser(data.user);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
                    <p className="text-gray-500">{error || "The user you are looking for does not exist."}</p>
                </div>
            </div>
        );
    }

    // Destructure for easier access
    const { name, email, phone, location, jobSeekerProfile } = profileUser;
    // Fallback to empty object if jobSeekerProfile is missing (though it should exist for jobseekers)
    const jp = jobSeekerProfile || {};

    const avatarUrl = profileUser.avatar || "https://ui-avatars.com/api/?name=" + name;
    const isOwnProfile = currentUser && (currentUser.username === username || currentUser._id === profileUser._id);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
            {/* Header / Hero */}
            <div className="border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-800 flex-shrink-0">
                            <img
                                src={avatarUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + name; }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{name}</h1>
                                    <p className="text-xl text-gray-500 dark:text-gray-400 capitalize">
                                        {jp.jobSeekerIndustry || "Open to Work"} • {jp.experienceLevel || "Entry Level"}
                                    </p>
                                </div>

                                {isOwnProfile && (
                                    <Link
                                        to="/profile-completion"
                                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium text-sm hover:opacity-80 transition-opacity"
                                    >
                                        <Edit2 size={16} />
                                        <span>Edit Profile</span>
                                    </Link>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                {location && (location.city || location.state) && (
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} />
                                        <span>{location.city}{location.city && location.state ? ', ' : ''}{location.state}</span>
                                    </div>
                                )}
                                {/* Email is typically private on public profile unless specified, but showing for now as per "anyone can access" request */}
                                <div className="flex items-center gap-1">
                                    <Mail size={16} />
                                    <span>{email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Phone size={16} />
                                    <span>{phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>Member since {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className={`w-2.5 h-2.5 rounded-full ${profileUser.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    <span>{profileUser.isActive ? 'Active Now' : 'Inactive'}</span>
                                </div>
                                {jp.resume && jp.resume.url && (
                                    <a
                                        href={jp.resume.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                        <LinkIcon size={16} />
                                        <span>Download Resume</span>
                                    </a>
                                )}
                                {jp.portfolio && (
                                    <a href={jp.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
                                        <LinkIcon size={16} />
                                        <span>Portfolio</span>
                                    </a>
                                )}
                            </div>

                            {/* Bio */}
                            {jp.bio && (
                                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 max-w-2xl">
                                    {jp.bio}
                                </p>
                            )}

                            {/* Skills Tags */}
                            {jp.skills && jp.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {jp.skills.map((skill, index) => (
                                        <span key={index} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-sm font-medium border border-gray-200 dark:border-gray-800">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Experience Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg">
                                <Briefcase size={20} />
                            </div>
                            <h2 className="text-2xl font-bold">Experience</h2>
                        </div>

                        {jp.workExperience && jp.workExperience.length > 0 ? (
                            <div className="space-y-8">
                                {jp.workExperience.map((exp, idx) => (
                                    <div key={idx} className="relative pl-8 border-l border-gray-200 dark:border-gray-800">
                                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-black dark:bg-white"></div>
                                        <h3 className="text-lg font-bold">{exp.position}</h3>
                                        <div className="text-gray-500 dark:text-gray-400 mb-2">{exp.company}</div>
                                        <div className="text-sm text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} - {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A')}
                                        </div>
                                        {exp.description && <p className="text-gray-600 dark:text-gray-300">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No experience added yet.</p>
                        )}
                    </div>

                    {/* Education Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg">
                                <GraduationCap size={20} />
                            </div>
                            <h2 className="text-2xl font-bold">Education</h2>
                        </div>

                        {jp.education && jp.education.length > 0 ? (
                            <div className="space-y-8">
                                {jp.education.map((edu, idx) => (
                                    <div key={idx} className="relative pl-8 border-l border-gray-200 dark:border-gray-800">
                                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-black dark:bg-white"></div>
                                        <h3 className="text-lg font-bold">{edu.institution}</h3>
                                        <div className="text-gray-500 dark:text-gray-400 mb-2">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                                        <div className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : 'N/A'} - {edu.current ? 'Present' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'N/A')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No education details added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
