import { useState, useEffect } from 'react';

const STORAGE_KEY = 'savedJobs';
const EXPIRATION_DAYS = 60;
const EXPIRATION_MS = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export const useSavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState({});

    // Load saved jobs from localStorage on mount
    useEffect(() => {
        loadSavedJobs();
    }, []);

    const loadSavedJobs = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Clean up expired jobs
                const now = Date.now();
                const cleaned = {};

                Object.entries(parsed).forEach(([jobId, data]) => {
                    if (now - data.savedAt < EXPIRATION_MS) {
                        cleaned[jobId] = data;
                    }
                });

                // Update localStorage if we cleaned anything
                if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
                }

                setSavedJobs(cleaned);
            }
        } catch (error) {
            console.error('Error loading saved jobs:', error);
            setSavedJobs({});
        }
    };

    const saveJob = (job) => {
        try {
            const newSavedJobs = {
                ...savedJobs,
                [job._id]: {
                    job,
                    savedAt: Date.now()
                }
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedJobs));
            setSavedJobs(newSavedJobs);
            return true;
        } catch (error) {
            console.error('Error saving job:', error);
            return false;
        }
    };

    const unsaveJob = (jobId) => {
        try {
            const newSavedJobs = { ...savedJobs };
            delete newSavedJobs[jobId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedJobs));
            setSavedJobs(newSavedJobs);
            return true;
        } catch (error) {
            console.error('Error unsaving job:', error);
            return false;
        }
    };

    const isSaved = (jobId) => {
        return !!savedJobs[jobId];
    };

    const getSavedJobsList = () => {
        return Object.values(savedJobs)
            .map(data => ({
                ...data.job,
                savedAt: data.savedAt,
                expiresAt: data.savedAt + EXPIRATION_MS
            }))
            .sort((a, b) => b.savedAt - a.savedAt); // Most recent first
    };

    const getDaysUntilExpiration = (savedAt) => {
        const expiresAt = savedAt + EXPIRATION_MS;
        const daysLeft = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
        return Math.max(0, daysLeft);
    };

    return {
        saveJob,
        unsaveJob,
        isSaved,
        getSavedJobsList,
        getDaysUntilExpiration,
        savedCount: Object.keys(savedJobs).length
    };
};
