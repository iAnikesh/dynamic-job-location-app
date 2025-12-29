const { google } = require('googleapis');

/**
 * Creates a new Google Meet space
 * @returns {Promise<string>} The meeting URI
 */
const createMeeting = async () => {
    try {
        // Check if credentials exist
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
            console.warn('Google Meet credentials missing. Using mock link for development.');
            return `https://meet.google.com/mock-${Math.random().toString(36).substring(7)}`;
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173'
        );

        auth.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const meet = google.meet({ version: 'v2', auth });

        // Create a meeting space
        const response = await meet.spaces.create({
            requestBody: {}
        });

        return response.data.meetingUri;
    } catch (error) {
        console.error('Error creating Google Meet:', error);
        // In case of error (e.g. invalid tokens), fallback to mock in dev or rethrow
        if (process.env.NODE_ENV !== 'production') {
            return `https://meet.google.com/err-fallback-${Date.now()}`;
        }
        throw error;
    }
};

module.exports = { createMeeting };
