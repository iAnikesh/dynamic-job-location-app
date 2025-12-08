To create a dynamic job location tracker for recruiters and job seekers. Job seekers and recruiters will register, and administrators will validate participants. Recruiters can post job openings, and job seekers can apply and track their locations. End-users (job seekers) can filter openings based on location, experience level, and industry, ensuring a streamlined job search process.


## Essential Features
	•	Registration & Validation
	    •	Secure registration for job seekers and recruiters.
	    •	Admin dashboard for participant approval and activity monitoring.
	•	Job Posting & Application
	    •	Recruiters create and manage job listings, specifying location, required experience, and industry.
	    •	Job seekers browse openings and apply in one click with an integrated resume upload.
	•	Filtering & Search
	    •	Advanced filters for job seekers: by location, experience level, industry, and keyword.
	    •	Sort jobs by date posted, relevance, or recruiter rating.
	•	Application Tracking
	    •	Job seekers have a dashboard showing all licenses (applications) and current status: Applied, Interviewing,    Offered, Rejected.
	    •	Recruiters can manage their posted jobs, shortlist candidates, and schedule interviews.


# A. Authentication & Role Assignment
-- Job Seekers, Recruiters, and Admins register separately.
-- Admins validate all new accounts to maintain data hygiene and avoid platform contamination.
# B. Recruiter Dashboard
-- Post job openings with:
---- Role
---- Required experience
---- Industry
-- Exact location (lat/long, pin code, or map drop-pin)
-- Track applicants visually on an integrated map.
-- Filter applicants by distance radius, skill match %, and experience bandwidth.
# C. Job Seeker Dashboard
-- Live geo-tracking (user location auto-sync through HTML5 Geolocation or mobile app).
-- Personalized job recommendations using:
---- Preferred radius (e.g., 5 km, 20 km)
---- Industry filters
---- Experience filters
-- Apply with one tap; receive real-time status updates.
# D. Interactive Geo-Map Layer
-- This is the platform’s “wow factor.”
-- Recruiters see candidate clusters.
-- Job seekers see nearby active job hotspots.
-- Use Google Maps API / Leaflet.js for dynamic rendering.
-- Optional heatmap view showing market demand intensity.
