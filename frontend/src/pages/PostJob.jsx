// frontend/src/pages/PostJob.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { INDUSTRIES } from '../constants/industries';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Briefcase, MapPin, DollarSign, FileText, Plus, X, Globe, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
    industry: [],
    experienceLevel: 'mid',
    experienceMin: '',
    experienceMax: '',
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
    applicationUrl: '',
    benefits: '',
    responsibilities: '',
    qualifications: '',
    isUrgent: false
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

      // Check if current user is the owner
      const recruiterId = job.recruiterId?._id || job.recruiterId;
      const userId = user.id || user._id;

      if (user && recruiterId?.toString() !== userId?.toString()) {
        toast.error("You are not authorized to edit this job");
        navigate('/dashboard');
        return;
      }

      setFormData({
        title: job.title || '',
        description: job.description || '',
        jobType: job.jobType || 'full-time',
        workMode: job.workMode || 'onsite',
        industry: job.industry || [],
        experienceLevel: job.experienceLevel || 'mid',
        experienceMin: job.experienceRequired?.min || '',
        experienceMax: job.experienceRequired?.max || '',
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
        applicationUrl: job.applicationUrl || '',
        benefits: job.benefits ? job.benefits.join('\n') : '',
        responsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
        qualifications: job.qualifications ? job.qualifications.join('\n') : '',
        isUrgent: job.isUrgent || false
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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleDescriptionChange = (content) => {
    setFormData({ ...formData, description: content });
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
        experienceRequired: {
          min: formData.experienceMin ? Number(formData.experienceMin) : 0,
          max: formData.experienceMax ? Number(formData.experienceMax) : undefined
        },
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
        applicationUrl: formData.applicationUrl,
        benefits: formData.benefits.split('\n').filter(Boolean),
        responsibilities: formData.responsibilities.split('\n').filter(Boolean),
        qualifications: formData.qualifications.split('\n').filter(Boolean),
        isUrgent: formData.isUrgent
      };

      if (id) {
        // Update existing job
        await axios.put(`/api/jobs/${id}`, jobData);
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              {id ? 'Edit Job' : 'Post a New Job'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {id ? 'Update the details of your job posting' : 'Fill in the details to attract the best candidates'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <Briefcase size={20} />
                </div>
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                  <div className="mt-3 flex items-center">
                    <input
                      type="checkbox"
                      name="isUrgent"
                      id="isUrgent"
                      checked={formData.isUrgent}
                      onChange={handleChange}
                      className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="isUrgent" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      Urgent Hiring (Notify nearby candidates)
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white">
                    <ReactQuill
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      theme="snow"
                      className="text-black dark:text-white min-h-[200px]"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          ['link', 'clean']
                        ],
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none/0 transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
                  <Select
                    isMulti
                    name="industry"
                    options={INDUSTRIES}
                    value={INDUSTRIES.filter(option => formData.industry.includes(option.value))}
                    onChange={(selectedOptions) => {
                      setFormData({
                        ...formData,
                        industry: selectedOptions ? selectedOptions.map(opt => opt.value) : []
                      });
                    }}
                    className="basic-multi-select text-black"
                    classNamePrefix="select"
                    placeholder="Select industries..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '0.5rem',
                        borderColor: '#d1d5db',
                        padding: '2px',
                      }),
                      option: (base, state) => ({
                        ...base,
                        color: 'black',
                        backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                      })
                    }}
                  />
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="e.g. React, Node.js, MongoDB, TypeScript"
                  />
                </div>
              </div>
            </div>

            {/* Experience & Education */}
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <UserCheck size={20} />
                </div>
                Experience & Requirements
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Min Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experienceMin"
                    min="0"
                    value={formData.experienceMin}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="0"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Max Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experienceMax"
                    min="0"
                    value={formData.experienceMax}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="5"
                  />
                </div> */}
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                  <DollarSign size={20} />
                </div>
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
              <h2 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                  <MapPin size={20} />
                </div>
                Location
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Search Location <span className="text-red-500">*</span>
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
                            padding: '4px',
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="locationCity"
                    required
                    value={formData.locationCity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                  <FileText size={20} />
                </div>
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    External Application URL (Optional)
                  </label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      name="applicationUrl"
                      value={formData.applicationUrl}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                      placeholder="https://company.com/careers/apply/123"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    If provided, applicants will be redirected to this URL instead of applying through the portal.
                  </p>
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="Design and develop web applications&#10;Review code and mentor junior developers&#10;Collaborate with product teams"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="5+ years of experience in web development&#10;Strong knowledge of React and Node.js&#10;Excellent problem-solving skills"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="Health insurance&#10;401(k) matching&#10;Remote work options&#10;Professional development budget"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? 'Saving...' : (id ? 'Update Job Posting' : 'Post Job Now')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;