import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileCompletion from './pages/ProfileCompletion';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

import './App.css';



function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Header />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/profile/:username" element={<Profile />} />

              {/* Protected Routes */}
              <Route path="/profile-completion"
                element={
                  <ProtectedRoute>
                    <ProfileCompletion />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/post-job"
                element={
                  <ProtectedRoute>
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route path="/edit-job/:id"
                element={
                  <ProtectedRoute>
                    <PostJob />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<div className="p-8 text-center text-xl">404 - Page Not Found</div>} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
