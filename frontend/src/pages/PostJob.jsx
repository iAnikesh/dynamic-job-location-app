// frontend/src/pages/PostJob.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Briefcase, MapPin, DollarSign, FileText, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(!!id);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: 'full-time',
    workMode: 'onsite',
    industry: '',
    experienceLevel: 'mid',
    skills: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    locationCity: '',
    locationState: '',
    locationCountry: '',
    locationAddress: '',
    openings: 1,
    applicationDeadline: '',
    benefits: '',
    responsibilities: '',
    qualifications: ''
  });

  const [locationValue, setLocationValue] = useState(null);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const { data } = await axios.get(`/api/jobs/${id}`);
      const job = data.job;

      // Check if current user is the owner (client-side check, server also checks)
      if (user && job.recruiterId._id !== user._id) {
        toast.error("You are not authorized to edit this job");
        navigate('/dashboard');
        return;
      }

      setFormData({
        title: job.title || '',
        description: job.description || '',
        jobType: job.jobType || 'full-time',
        workMode: job.workMode || 'onsite',
        industry: job.industry || '',
        experienceLevel: job.experienceLevel || 'mid',
        skills: job.skills ? job.skills.join(', ') : '',
        salaryMin: job.salary?.min || '',
        salaryMax: job.salary?.max || '',
        salaryCurrency: job.salary?.currency || 'USD',
        salaryPeriod: job.salary?.period || 'yearly',
        locationCity: job.location?.city || '',
        locationState: job.location?.state || '',
        locationCountry: job.location?.country || '',
        locationAddress: job.location?.address || '',
        locationCoordinates: job.location?.coordinates ? { lng: job.location.coordinates[0], lat: job.location.coordinates[1] } : null,
        openings: job.openings || 1,
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
        benefits: job.benefits ? job.benefits.join('\n') : '',
        responsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
        qualifications: job.qualifications ? job.qualifications.join('\n') : ''
      });

      if (job.location?.address) {
        setLocationValue({ label: job.location.address, value: job.location.address });
      }

    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
      navigate('/dashboard');
    } finally {
      setFetchingJob(false);
    }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (val) => {
    setLocationValue(val);
    geocodeByAddress(val.label)
      .then(results => {
        const result = results[0];
        // Parse address components
        const addressMap = {};
        result.address_components.forEach(component => {
          const types = component.types;
          if (types.includes('locality')) addressMap.city = component.long_name;
          if (types.includes('administrative_area_level_1')) addressMap.state = component.long_name;
          if (types.includes('country')) addressMap.country = component.long_name;
        });

        // Get coordinates
        return getLatLng(result).then(({ lat, lng }) => {
          setFormData(prev => ({
            ...prev,
            locationAddress: result.formatted_address,
            locationCity: addressMap.city || '',
            locationState: addressMap.state || '',
            locationCountry: addressMap.country || '',
            locationCoordinates: { lat, lng } // Store internally
          }));
        });
      })
      .catch(error => console.error('Geocoding error:', error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        jobType: formData.jobType,
        workMode: formData.workMode,
        industry: formData.industry,
        experienceLevel: formData.experienceLevel,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        salary: {
          min: formData.salaryMin ? Number(formData.salaryMin) : null,
          max: formData.salaryMax ? Number(formData.salaryMax) : null,
          currency: formData.salaryCurrency,
          period: formData.salaryPeriod
        },
        location: {
          type: 'Point',
          coordinates: formData.locationCoordinates ? [formData.locationCoordinates.lng, formData.locationCoordinates.lat] : undefined,
          address: formData.locationAddress,
          city: formData.locationCity,
          state: formData.locationState,
          country: formData.locationCountry
        },
        openings: Number(formData.openings),
        applicationDeadline: formData.applicationDeadline || null,
        benefits: formData.benefits.split('\n').filter(Boolean),
        responsibilities: formData.responsibilities.split('\n').filter(Boolean),
        qualifications: formData.qualifications.split('\n').filter(Boolean)
      };

      if (id) {
        // Update existing job
        const { data } = await axios.put(`/api/jobs/${id}`, jobData);
        toast.success('Job updated successfully!');
        navigate('/dashboard'); // Go back to dashboard after edit
      } else {
        // Create new job
        const { data } = await axios.post('/api/jobs/create', jobData);
        toast.success('Job posted successfully!');
        navigate(`/jobs/${data.job._id}`);
      }
    } catch (error) {
      console.error('Post/Update job error:', error);
      toast.error(error.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only recruiters can post jobs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              {id ? 'Edit Job' : 'Post a New Job'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {id ? 'Update the details of your job posting' : 'Fill in the details to attract the best candidates'}
            </p>
          </div>

          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <Briefcase size={20} />
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="Describe the role, company culture, and what makes this position unique..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Job Type *
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                  >
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
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="e.g. Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="e.g. React, Node.js, MongoDB, TypeScript"
                  />
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                Compensation
              </h2>

              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Min Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Max Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="80000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Currency
                  </label>
                  <select
                    name="salaryCurrency"
                    value={formData.salaryCurrency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Period
                  </label>
                  <select
                    name="salaryPeriod"
                    value={formData.salaryPeriod}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Location
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Search Location *
                  </label>
                  <div className="text-black">
                    <GooglePlacesAutocomplete
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                      selectProps={{
                        value: locationValue,
                        onChange: handleLocationSelect,
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Full Address
                  </label>
                  <input
                    type="text"
                    name="locationAddress"
                    value={formData.locationAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    City *
                  </label>
                  <input
                    type="text"
                    name="locationCity"
                    required
                    value={formData.locationCity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    name="locationState"
                    value={formData.locationState}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="California"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <input
                    type="text"
                    name="locationCountry"
                    value={formData.locationCountry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <FileText size={20} />
                Additional Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Number of Openings
                  </label>
                  <input
                    type="number"
                    name="openings"
                    min="1"
                    value={formData.openings}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="Design and develop web applications
Review code and mentor junior developers
Collaborate with product teams"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Qualifications (one per line)
                  </label>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="5+ years of experience in web development
Strong knowledge of React and Node.js
Excellent problem-solving skills"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Benefits (one per line)
                  </label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="Health insurance
401(k) matching
Remote work options
Professional development budget"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Saving...' : (id ? 'Update Job' : 'Post Job')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;