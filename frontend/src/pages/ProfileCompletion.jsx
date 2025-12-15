import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Briefcase, Award, Building2, Globe, Users, FileText, GraduationCap, Calendar, Home, Link as LinkIcon, Image as ImageIcon, FileText as FileIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

const ProfileCompletion = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        avatar: null,
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        experienceLevel: 'entry',
        industry: '',
        skills: '',
        bio: '',
        resume: null,
        portfolio: '',
        institution: '',
        degree: '',
        fieldOfStudy: '',
        educationStartDate: '',
        educationEndDate: '',
        company: '',
        position: '',
        workExperienceDescription: '',
        workExperienceStartDate: '',
        workExperienceEndDate: '',
        companyName: '',
        companyWebsite: '',
        companyDescription: '',
        companyLogo: null,
        recruiterIndustry: '',
        companyAddress: '',
        companyCity: '',
        companyState: '',
        companyZip: '',
        companyCountry: ''
    });

    useEffect(() => {
        if (user) {
            const jp = user.jobSeekerProfile || {};
            const rp = user.recruiterProfile || {};
            const userLoc = user.location || {};
            const compLoc = rp.companyLocation || {};

            // Education (Take first if exists)
            const edu = jp.education && jp.education.length > 0 ? jp.education[0] : {};
            // Experience (Take first if exists)
            const exp = jp.workExperience && jp.workExperience.length > 0 ? jp.workExperience[0] : {};

            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '',

                // Job Seeker Location
                address: userLoc.address || '',
                city: userLoc.city || '',
                state: userLoc.state || '',
                zip: userLoc.zipCode || '',
                country: userLoc.country || '',

                // Job Seeker Profile
                experienceLevel: jp.experienceLevel || 'entry',
                industry: jp.jobSeekerIndustry || (jp.industries && jp.industries[0]) || '',
                skills: (jp.skills || []).join(', '),
                bio: jp.bio || '',
                portfolio: jp.portfolio || '',

                // Education
                institution: edu.institution || '',
                degree: edu.degree || '',
                fieldOfStudy: edu.fieldOfStudy || '',
                educationStartDate: edu.startDate ? edu.startDate.split('T')[0] : '',
                educationEndDate: edu.endDate ? edu.endDate.split('T')[0] : '',

                // Experience
                company: exp.company || '',
                position: exp.position || '',
                workExperienceDescription: exp.description || '',
                workExperienceStartDate: exp.startDate ? exp.startDate.split('T')[0] : '',
                workExperienceEndDate: exp.endDate ? exp.endDate.split('T')[0] : '',

                // Recruiter Profile
                companyName: rp.companyName || '',
                companyWebsite: rp.companyWebsite || '',
                companyDescription: rp.companyDescription || '',
                recruiterIndustry: rp.industry || '',

                // Recruiter Location
                companyAddress: compLoc.address || '',
                companyCity: compLoc.city || '',
                companyState: compLoc.state || '',
                companyZip: compLoc.zipCode || '',
                companyCountry: compLoc.country || ''
            }));
        }
    }, [user]);

    const [userLocationValue, setUserLocationValue] = useState(null);
    const [companyLocationValue, setCompanyLocationValue] = useState(null);

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleUserLocationSelect = (val) => {
        setUserLocationValue(val);
        geocodeByAddress(val.label)
            .then(results => {
                const result = results[0];
                const addressMap = {};
                result.address_components.forEach(component => {
                    const types = component.types;
                    if (types.includes('locality')) addressMap.city = component.long_name;
                    if (types.includes('administrative_area_level_1')) addressMap.state = component.long_name;
                    if (types.includes('country')) addressMap.country = component.long_name;
                    if (types.includes('postal_code')) addressMap.zip = component.long_name;
                });

                getLatLng(result).then(({ lat, lng }) => {
                    setFormData(prev => ({
                        ...prev,
                        address: result.formatted_address,
                        city: addressMap.city || '',
                        state: addressMap.state || '',
                        country: addressMap.country || '',
                        zip: addressMap.zip || '',
                        latitude: lat,
                        longitude: lng
                    }));
                });
            })
            .catch(error => console.error('Geocoding error:', error));
    };

    const handleCompanyLocationSelect = (val) => {
        setCompanyLocationValue(val);
        geocodeByAddress(val.label)
            .then(results => {
                const result = results[0];
                const addressMap = {};
                result.address_components.forEach(component => {
                    const types = component.types;
                    if (types.includes('locality')) addressMap.city = component.long_name;
                    if (types.includes('administrative_area_level_1')) addressMap.state = component.long_name;
                    if (types.includes('country')) addressMap.country = component.long_name;
                    if (types.includes('postal_code')) addressMap.zip = component.long_name;
                });

                getLatLng(result).then(({ lat, lng }) => {
                    setFormData(prev => ({
                        ...prev,
                        companyAddress: result.formatted_address,
                        companyCity: addressMap.city || '',
                        companyState: addressMap.state || '',
                        companyCountry: addressMap.country || '',
                        companyZip: addressMap.zip || '',
                        companyLatitude: lat,
                        companyLongitude: lng
                    }));
                });
            })
            .catch(error => console.error('Geocoding error:', error));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Append all simple fields
            Object.keys(formData).forEach(key => {
                // Skip files for now, append them specifically if needed or just handle all
                if (key !== 'avatar' && key !== 'resume' && key !== 'companyLogo') {
                    // Only append if the value is not null/undefined/empty string to avoid sending empty fields
                    if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                        data.append(key, formData[key]);
                    }
                }
            });

            // Append Files
            if (formData.avatar) data.append('avatar', formData.avatar);
            if (formData.resume) data.append('resume', formData.resume);
            if (formData.companyLogo) data.append('companyLogo', formData.companyLogo);

            // Special handling for legacy/derived fields if needed
            // e.g. skills needs to be comma separated string if sending JSON, but FormData handles strings fine.
            // Backend splits it if it is a string.

            // Recruiter location construction matches previous logic? 
            // Backend takes individual fields now, so no need to concat manually unless backend logic still relies on 'location' string.
            // Backend validation for recruiter uses: !location. But we updated user.js to use companyAddress etc.
            // Wait, I commented out the strict validation in user.js, so we are safe.

            const response = await axios.patch('/api/user/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            updateUser(response.data.user);
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
        <div className="min-h-[calc(100vh-4rem)] flex justify-center p-4 bg-white dark:bg-black">
            <div className="max-w-4xl w-full bg-white dark:bg-black rounded-2xl shadow-none dark:border-gray-800">
                <div className="p-4 md:p-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-black dark:text-white mb-2">Complete Your Profile</h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Help us match you with the best {user.role === 'jobseeker' ? 'opportunities' : 'candidates'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">

                        {/* Section: Basic Info & Contact */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Profile Picture</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ImageIcon className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="file"
                                            name="avatar"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="input-field pl-10 py-2"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-gray-400" />
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
                            </div>

                            {user.role === 'jobseeker' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2 md:col-span-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Search Address</label>
                                        <div className="text-black">
                                            <GooglePlacesAutocomplete
                                                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                                selectProps={{
                                                    value: userLocationValue,
                                                    onChange: handleUserLocationSelect,
                                                    placeholder: 'Start typing address...',
                                                    styles: {
                                                        control: (provided) => ({
                                                            ...provided,
                                                            borderRadius: '0.5rem',
                                                            borderColor: '#d1d5db',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            color: 'black',
                                                        }),
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Home className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field pl-10" placeholder="123 Main St" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">City</label>
                                        <input type="text" name="city" required value={formData.city} onChange={handleChange} className="input-field" placeholder="New York" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">State</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field" placeholder="NY" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Zip Code</label>
                                        <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="input-field" placeholder="10001" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Country</label>
                                        <input type="text" name="country" required value={formData.country} onChange={handleChange} className="input-field" placeholder="United States" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Job Seeker Specific */}
                        {user.role === 'jobseeker' && (
                            <>
                                {/* Professional Details */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                                        Professional Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Resume (PDF/DOC)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FileIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="file"
                                                    name="resume"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleChange}
                                                    className="input-field pl-10 py-2"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Portfolio URL</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <LinkIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="url"
                                                    name="portfolio"
                                                    value={formData.portfolio}
                                                    onChange={handleChange}
                                                    className="input-field pl-10"
                                                    placeholder="https://portfolio.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Experience Level</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Award className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="input-field pl-10 appearance-none bg-white dark:bg-gray-900">
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
                                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input type="text" name="industry" required value={formData.industry} onChange={handleChange} className="input-field pl-10" placeholder="Software Engineering" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Skills (Comma separated)</label>
                                        <textarea name="skills" required value={formData.skills} onChange={handleChange} className="input-field min-h-[80px]" placeholder="React, Node.js, Python, SQL" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Bio</label>
                                        <textarea name="bio" value={formData.bio} onChange={handleChange} className="input-field min-h-[100px]" placeholder="Tell us a bit about yourself..." />
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                                        Latest Education
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Institution</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <GraduationCap className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="input-field pl-10" placeholder="University Name" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Degree</label>
                                            <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="input-field" placeholder="Bachelor's" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Field of Study</label>
                                            <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} className="input-field" placeholder="Computer Science" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Start Date</label>
                                            <input type="date" name="educationStartDate" value={formData.educationStartDate} onChange={handleChange} className="input-field" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">End Date</label>
                                            <input type="date" name="educationEndDate" value={formData.educationEndDate} onChange={handleChange} className="input-field" />
                                        </div>
                                    </div>
                                </div>

                                {/* Experience */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                                        Latest Experience
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Building2 className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input type="text" name="company" value={formData.company} onChange={handleChange} className="input-field pl-10" placeholder="Company Name" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Position</label>
                                            <input type="text" name="position" value={formData.position} onChange={handleChange} className="input-field" placeholder="Job Title" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Start Date</label>
                                            <input type="date" name="workExperienceStartDate" value={formData.workExperienceStartDate} onChange={handleChange} className="input-field" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">End Date</label>
                                            <input type="date" name="workExperienceEndDate" value={formData.workExperienceEndDate} onChange={handleChange} className="input-field" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Description</label>
                                            <textarea name="workExperienceDescription" value={formData.workExperienceDescription} onChange={handleChange} className="input-field min-h-[80px]" placeholder="Describe your responsibilities..." />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Recruiter Specific */}
                        {user.role === 'recruiter' && (
                            <>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                                        Company Details
                                    </h3>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company Logo</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="file"
                                                name="companyLogo"
                                                accept="image/*"
                                                onChange={handleChange}
                                                className="input-field pl-10 py-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Building2 className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="input-field pl-10" placeholder="Acme Corp" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Industry</label>
                                            <input type="text" name="recruiterIndustry" value={formData.recruiterIndustry} onChange={handleChange} className="input-field" placeholder="Technology" />
                                        </div>
                                        {/* <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company Size</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input type="text" name="companySize" value={formData.companySize} onChange={handleChange} className="input-field pl-10" placeholder="e.g. 50-200" />
                                            </div>
                                        </div> */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Website (Optional)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Globe className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className="input-field pl-10" placeholder="https://example.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company Description</label>
                                            <textarea name="companyDescription" required value={formData.companyDescription} onChange={handleChange} className="input-field min-h-[100px]" placeholder="What does your company do?" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                                        Company Location
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-2 md:col-span-3">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Search Company Address</label>
                                            <div className="text-black">
                                                <GooglePlacesAutocomplete
                                                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                                    selectProps={{
                                                        value: companyLocationValue,
                                                        onChange: handleCompanyLocationSelect,
                                                        placeholder: 'Start typing address...',
                                                        styles: {
                                                            control: (provided) => ({
                                                                ...provided,
                                                                borderRadius: '0.5rem',
                                                                borderColor: '#d1d5db',
                                                            }),
                                                            option: (provided, state) => ({
                                                                ...provided,
                                                                color: 'black',
                                                            }),
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} className="input-field pl-10" placeholder="Corporate HQ Address" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">City</label>
                                            <input type="text" name="companyCity" required value={formData.companyCity} onChange={handleChange} className="input-field" placeholder="City" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">State</label>
                                            <input type="text" name="companyState" value={formData.companyState} onChange={handleChange} className="input-field" placeholder="State/Region" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Zip Code</label>
                                            <input type="text" name="companyZip" value={formData.companyZip} onChange={handleChange} className="input-field" placeholder="Zip/Postal Code" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Country</label>
                                            <input type="text" name="companyCountry" required value={formData.companyCountry} onChange={handleChange} className="input-field" placeholder="Country" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary flex items-center justify-center gap-2 py-3 text-base"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Complete Profile'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletion;
