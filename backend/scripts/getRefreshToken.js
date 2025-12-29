require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

// Check for missing credentials
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in your .env file.');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173'
);

// Scope for creating Google Meet spaces
const SCOPES = ['https://www.googleapis.com/auth/meetings.space.created'];

const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Critical to get a refresh token
    scope: SCOPES,
    prompt: 'consent' // Forces consent screen to ensure refresh token is returned
});

console.log('\n--- Google Refresh Token Generator ---\n');
console.log('1. Call this URL in your browser:');
console.log(url);
console.log('\n2. Authorize the app with your Google account.');
console.log('3. You will be redirected to your app (e.g., localhost:5173).');
console.log('4. Copy the "code" parameter from the URL bar (everything after code= and before &).');
console.log('\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Paste the code here: ', async (code) => {
    try {
        // Decode if the user pasted a URL-encoded string
        const decodedCode = decodeURIComponent(code);

        const { tokens } = await oauth2Client.getToken(decodedCode);

        console.log('\n✅ Success! Here is your Refresh Token:\n');
        console.log(tokens.refresh_token);
        console.log('\n--------------------------------------');
        console.log('Paste this into your backend/.env file:');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    } catch (error) {
        console.error('\n❌ Error retrieving access token:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
    rl.close();
});
