// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Header from "./components/Header.jsx";
import Profile from "./pages/Profile.jsx";
import JobSeekerDashboard from "./pages/JobSeekerDashboard.jsx";
import RecruiterDashboard from "./pages/RecruiterDashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import RoleRoute from "./components/RoleRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><JobSeekerDashboard /></ProtectedRoute>} />
          <Route path="/recruiter/dashboard" element={<RoleRoute role="recruiter"><RecruiterDashboard /></RoleRoute>} />
          {/* add other routes as needed */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}