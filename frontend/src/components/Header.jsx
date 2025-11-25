// src/components/Header.jsx
import { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { HiMenu, HiX, HiOutlineUserCircle } from "react-icons/hi";
import LocationModal from "./LocationModal";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const commonLinks = (
    <>
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/jobs" className="nav-link">Jobs</Link>
      <Link to="/about" className="nav-link">About</Link>
    </>
  );

  const seekerLinks = (
    <>
      <Link to="/jobs/saved" className="nav-link">Saved</Link>
      <Link to="/applications" className="nav-link">Applications</Link>
    </>
  );

  const recruiterLinks = (
    <>
      <Link to="/post-job" className="nav-link">Post Job</Link>
      <Link to="/candidates" className="nav-link">Candidates</Link>
    </>
  );

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-semibold text-sky-600">JobTracker</Link>
            <nav className="hidden md:flex items-center gap-4 text-gray-600">
              {commonLinks}
              {user?.role === "recruiter" ? recruiterLinks : null}
              {user?.role === "jobseeker" ? seekerLinks : null}
            </nav>
          </div>

{user && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                    <span className="text-sm text-gray-600">
                    {user.selectedLocation ? (
                        <>
                        <strong>{user.selectedLocation}</strong>
                        </>
                    ) : (
                        "Select Job Location"
                    )}
                    </span>

                    <button
                    onClick={() => setShowLocationModal(true)}
                    className="text-xs text-sky-600 hover:underline"
                    >
                    {user.selectedLocation ? "Edit" : "Set"}
                    </button>
                </div>
            )}
          <div className="flex items-center gap-3">
            {/* auth buttons */}
            {!user ? (
              <div className="hidden md:flex gap-2">
                <Link to="/login" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50">Log in</Link>
                <Link to="/register" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">Sign up</Link>
              </div>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setProfileOpen((s) => !s)}
                  className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-50"
                >
                  <HiOutlineUserCircle className="w-6 h-6 text-sky-600" />
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">{user.name || user.email}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                </button>

            

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg py-2 text-sm">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <Link to="/profile/selected-location" className="dropdown-item">Selected Job Location</Link>
                    <Link to="/profile/edit" className="dropdown-item">Edit Profile</Link>
                    <Link to="/profile/membership" className="dropdown-item">Membership</Link>
                    <Link to="/profile/projects" className="dropdown-item">Project History</Link>
                    <Link to="/profile/finance" className="dropdown-item">Financial Dashboard</Link>
                    <div className="my-1 border-t" />
                    <Link to={user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} className="dropdown-item">Dashboard</Link>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50">Logout</button>
                  </div>
                )}
              </div>
            )}

            {/* mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setOpen((s) => !s)}>
              {open ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t bg-white">
          <div className="px-4 py-3 flex flex-col gap-2">
            {commonLinks}
            {user?.role === "recruiter" ? recruiterLinks : null}
            {user?.role === "jobseeker" ? seekerLinks : null}
            <div className="border-t pt-2">
              {!user ? (
                <>
                  <Link to="/login" className="block py-2">Log in</Link>
                  <Link to="/register" className="block py-2">Sign up</Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="block py-2">Profile</Link>
                  <button onClick={onLogout} className="block py-2 text-left">Logout</button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
      {showLocationModal && (
  <LocationModal close={() => setShowLocationModal(false)} />
)}
    </header>
  );
}