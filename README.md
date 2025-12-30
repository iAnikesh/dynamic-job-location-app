# Hiree.work - Dynamic Job Location Tracker & Recruitment Platform

A comprehensive full-stack job recruitment platform that connects job seekers with recruiters through intelligent location-based matching, real-time notifications, and streamlined application management.

## 🌟 Key Features

### For Job Seekers
- **Smart Job Matching**: Job recommendations based on skills, industry preferences, and location
- **Location-Based Search**: Find jobs near you with radius-based filtering using geospatial queries
- **Real-time Notifications**: Instant alerts for new job matches and application updates
- **Application Tracking**: Monitor application status from submission to offer
- **Profile Management**: Comprehensive profiles with resume uploads, work experience, and education history
- **Save Jobs**: Bookmark interesting opportunities for later review (60-day expiration)
- **Interview Scheduling**: Seamless Google Meet integration for virtual interviews

### For Recruiters
- **Job Posting Management**: Create, edit, and manage job listings with rich text descriptions
- **Applicant Tracking System (ATS)**: Track and manage applications through various stages
- **Automated Interview Scheduling**: Generate Google Meet links automatically when moving candidates to interview stage
- **Application Analytics**: View application counts, views, and engagement metrics
- **Candidate Search**: Filter and sort applicants based on qualifications
- **Urgent Hiring Alerts**: Notify nearby candidates for time-sensitive positions

### Admin Panel
- **User Management**: Approve, reject, or suspend user accounts
- **Job Moderation**: Review and approve job postings before going live
- **Analytics Dashboard**: Comprehensive insights into platform usage and trends
- **Application Monitoring**: Oversee all applications and their statuses

## 🛠️ Technology Stack

### Frontend
- **React 19.2** - Modern UI library with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first styling framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time bidirectional communication
- **React Hot Toast** - Elegant notification system
- **React Quill** - Rich text editor for job descriptions
- **React Select** - Advanced select components
- **Google Places Autocomplete** - Location search integration
- **Lucide React** - Modern icon library
- **DOMPurify** - XSS sanitization

### Backend
- **Node.js & Express** - Server runtime and web framework
- **MongoDB & Mongoose** - NoSQL database with ODM
- **Socket.io** - WebSocket implementation for real-time features
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service integration
- **Multer** - File upload handling
- **Google APIs** - Google Meet integration

### Infrastructure
- **Geospatial Indexing** - 2dsphere indexes for location-based queries
- **Cookie-based Sessions** - Secure authentication mechanism
- **Email Verification** - OTP-based password reset and email changes

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Google Cloud Platform account (for Maps API and Meet integration)
- Gmail account (for email notifications)

## 🚀 Installation & Setup

### 1. Clone the Repository
git clone https://github.com/yourusername/hiree-work.git
cd hiree-work

### 2. Backend Setup
cd backend
npm install

# Create .env file
cp .env.example .env

Configure your `.env` file:
# Server
PORT=4000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/hiree-work

# JWT
JWT_ACCESS_SECRET=your_jwt_secret_key_here

# Cookies
COOKIE_SECURE=false

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Google Services
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Frontend URL
CLIENT_URL=http://localhost:5173

### 3. Frontend Setup
cd frontend
npm install

# Create .env file
cp .env.example .env

Con	figure your frontend `.env`:
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

### 4. Admin Panel Setup (Optional)
cd backend/admin
npm install

### 5. Start the Application

**Terminal 1 - Backend:**
cd backend
npm run dev

**Terminal 2 - Frontend:**
cd frontend
npm run dev

**Terminal 3 - Admin Panel (Optional):**
cd backend/admin
node admin-server.js

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Admin Panel: http://localhost:5001

## 📱 Features Walkthrough

### User Registration & Profile Setup
1. Choose role (Job Seeker or Recruiter)
2. Complete multi-step profile with:
   - Personal information
   - Location details (with Google Places autocomplete)
   - Skills and experience (Job Seekers)
   - Company details (Recruiters)
   - Resume upload (Job Seekers)

### Job Search & Application
1. Browse jobs with advanced filters:
   - Location radius search
   - Industry matching
   - Experience level
   - Job type and work mode
2. Save interesting jobs for later
3. Apply with one click (or external redirect)
4. Track application status in real-time

### Recruitment Workflow
1. Post jobs with rich descriptions
2. Receive instant notifications for new applications
3. Review candidate profiles and resumes
4. Update application status through stages
5. Schedule interviews with auto-generated Google Meet links
6. Send automated email notifications to candidates

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth with HTTP-only cookies
- **Input Sanitization**: DOMPurify for XSS prevention
- **File Upload Validation**: Type and size restrictions
- **Rate Limiting**: Prevents abuse of API endpoints
- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Controlled cross-origin requests

## 🗃️ Database Schema

### Key Collections
- **Users**: Job seekers, recruiters, and admin accounts
- **Jobs**: Job postings with geospatial data
- **Applications**: Application tracking with status history
- **Notifications**: Real-time user notifications
- **LocationHistory**: GPS tracking for job search patterns

## 🎨 UI/UX Features

- **Dark Mode**: System-preference-aware theme switching
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton screens and spinners
- **Toast Notifications**: Non-intrusive user feedback
- **Form Validation**: Real-time input validation
- **Accessibility**: ARIA labels and keyboard navigation

## 📊 Admin Analytics

- User growth trends
- Job posting analytics
- Application metrics by status
- Industry distribution charts
- Recruiter performance metrics

## 🔄 Real-time Features

- New job match notifications
- Application status updates
- Interview scheduling alerts
- Urgent job notifications for nearby candidates

## 🚧 Roadmap

- [ ] Advanced analytics dashboard
- [ ] AI-powered job recommendations
- [ ] Video interview platform integration
- [ ] Skill assessment tests
- [ ] Company reviews and ratings
- [ ] Salary negotiation tools
- [ ] Mobile applications (iOS/Android)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Google Maps Platform for location services
- MongoDB for database support
- React community for excellent libraries
- All contributors and testers

## 📞 Support

For support, email support@hiree.work or join our Slack channel.

---

**Built with ❤️ by Anikesh**