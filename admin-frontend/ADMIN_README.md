# Admin Panel

## Setup

### Backend (Admin Server)
The admin backend runs on port 5000 (by default).

1. **Create Super Admin (First Time Only)**
   ```bash
   cd backend
   node admin/createAdmin.js
   ```

   This will create a super admin account with:
   - **Email**: admin@jobportal.com
   - **Password**: admin123
   
   ⚠️ **Please change this password after first login!**

2. **Start Admin Server**
   ```bash
   cd backend
   node admin-server.js
   ```

### Frontend (Admin Dashboard)
The admin frontend runs on port 5174 (by default).

1. **Install Dependencies** (if not already installed)
   ```bash
   cd admin-frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   cd admin-frontend
   npm run dev
   ```

3. **Access Admin Panel**
   Open your browser and navigate to: http://localhost:5174

## Features

### 1. Dashboard
- Overview statistics
- User registration trends
- Job posting trends
- Application analytics
- Industry distribution charts

### 2. User Management
- View all users (Job Seekers and Recruiters)
- Approve/Reject pending users
- Activate/Suspend user accounts
- View detailed user profiles
- Filter and search users

### 3. Job Management
- View all job postings
- Approve/Reject job postings
- Activate/Deactivate jobs
- View detailed job information
- Filter jobs by status, type

### 4. Applications
- View all job applications
- Filter by application status
- Access applicant information
- View resumes

### 5. Analytics
- Detailed charts and metrics
- Customizable time ranges (7/30/90 days)
- User distribution statistics
- Job statistics
- Application status breakdown
- Popular industries

## API Endpoints

Base URL: `http://localhost:5000/api/admin`

### Authentication
- `POST /auth/login` - Admin login
- `GET /auth/logout` - Admin logout
- `GET /auth/me` - Get current admin info

### Users
- `GET /users` - Get all users (with pagination and filters)
- `GET /users/:id` - Get user details
- `PUT /users/:id/approve` - Approve user
- `PUT /users/:id/reject` - Reject user
- `PUT /users/:id/toggle-active` - Toggle user active status
- `DELETE /users/:id` - Soft delete user

### Jobs
- `GET /jobs` - Get all jobs (with pagination and filters)
- `GET /jobs/:id` - Get job details
- `PUT /jobs/:id/approve` - Approve job
- `PUT /jobs/:id/reject` - Reject job
- `PUT /jobs/:id/toggle-active` - Toggle job active status

### Applications
- `GET /applications` - Get all applications (with pagination and filters)
- `GET /applications/:id` - Get application details
- `GET /applications/stats/overview` - Get application statistics

### Analytics
- `GET /analytics/dashboard` - Get dashboard data
- `GET /analytics/detailed?days=30` - Get detailed analytics

## Environment Variables

Create a `.env` file in the `admin-frontend` directory:

```env
VITE_ADMIN_API_URL=http://localhost:5000
```

The backend uses the main `.env` file in the `backend` directory. Ensure these variables are set:

```env
ADMIN_PORT=5000
ADMIN_CLIENT_URL=http://localhost:5174
JWT_ACCESS_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
```

## Tech Stack

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Cookie-based sessions

### Frontend
- React 19
- React Router for navigation
- Axios for API requests
- Recharts for data visualization
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications

## Security Features

- JWT-based authentication
- HTTP-only cookies
- CORS protection
- Password hashing with bcryptjs
- Protected routes
- Role-based permissions

## Default Admin Permissions

Super Admin has full access:
- Approve/reject users
- Approve/reject jobs
- Delete users and jobs
- View analytics
- Manage other admins

Regular Admin (can be customized):
- Approve/reject users
- Approve/reject jobs
- View analytics
- Limited deletion rights
