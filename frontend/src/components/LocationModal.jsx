import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LocationModal = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const [location, setLocation] = useState(user?.selectedLocation || '');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/user/location', { location });
            // Update local user state
            updateUser({ selectedLocation: location });
            toast.success(data.message || 'Location updated successfully');
            onClose();
        } catch (error) {
            console.error("Location update error", error);
            toast.error(error.response?.data?.message || 'Failed to update location');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="text-blue-500" size={20} />
                        Update Job Location
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preferred Job Location
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. New York, Remote, London"
                            className="input-field"
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            This helps us show you the most relevant job opportunities.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !location.trim()}
                            className="btn btn-primary text-sm flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save Location'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationModal;
