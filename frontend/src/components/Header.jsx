import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Briefcase, MapPin, Settings, ChevronDown, Edit2 } from 'lucide-react';
import LocationModal from './LocationModal';

const Header = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

    const isActive = (path) => location.pathname === path
        ? "text-black dark:text-white font-medium"
        : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors";

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <header
                className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
                    ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm'
                    : 'bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800'
                    }`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-200">
                                <Briefcase size={20} className="stroke-[2.5]" />
                            </div>
                            <span className="text-xl font-bold text-black dark:text-white tracking-tight">
                                JobFlow
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link to="/" className={isActive("/")}>Home</Link>
                            <Link to="/jobs" className={isActive("/jobs")}>Find Jobs</Link>

                            {user && (
                                <>
                                    {user.role === 'recruiter' && (
                                        <Link to="/post-job" className={isActive("/post-job")}>Post Job</Link>
                                    )}
                                    <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
                                </>
                            )}
                        </nav>

                        {/* User Actions (Desktop) */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <>
                                    {/* Location Selector (Job Seeker Only) */}
                                    {user.role === 'jobseeker' && (
                                        <button
                                            onClick={() => setIsLocationModalOpen(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-black dark:border-gray-800 dark:hover:border-white transition-all group"
                                        >
                                            <MapPin size={14} className="text-gray-500 group-hover:text-black dark:text-gray-400 dark:group-hover:text-white" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white max-w-[120px] truncate">
                                                {user.selectedLocation || 'Set Location'}
                                            </span>
                                            <Edit2 size={12} className="text-gray-400 group-hover:text-black dark:group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                    )}

                                    {/* Profile Dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={toggleProfile}
                                            className="flex items-center gap-2 focus:outline-none pl-2 border-l border-gray-100 dark:border-gray-800"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold ring-2 ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700 transition-all overflow-hidden">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{(user.username || user.name || "U").slice(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isProfileOpen && (
                                            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-black rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 animate-in fade-in zoom-in duration-200 ring-1 ring-black/5">
                                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                                                    <p className="font-semibold text-black dark:text-white truncate">{user.name || user.username}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>

                                                <Link
                                                    to={`/profile/${user.username}`}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <User size={16} />
                                                    Profile
                                                </Link>

                                                <Link
                                                    to="/settings"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Settings size={16} />
                                                    Settings
                                                </Link>

                                                <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                                                    <button
                                                        onClick={() => { logout(); setIsProfileOpen(false); }}
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                    >
                                                        <LogOut size={16} />
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm hover:shadow"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            <Link to="/" className={`block py-2 ${isActive("/")}`} onClick={toggleMenu}>Home</Link>
                            <Link to="/jobs" className={`block py-2 ${isActive("/jobs")}`} onClick={toggleMenu}>Find Jobs</Link>

                            {user && (
                                <>
                                    {user.role === 'recruiter' && (
                                        <Link to="/post-job" className={`block py-2 ${isActive("/post-job")}`} onClick={toggleMenu}>Post Job</Link>
                                    )}
                                    <Link to="/dashboard" className={`block py-2 ${isActive("/dashboard")}`} onClick={toggleMenu}>Dashboard</Link>

                                    {user.role === 'jobseeker' && (
                                        <button
                                            onClick={() => { toggleMenu(); setIsLocationModalOpen(true); }}
                                            className="flex w-full items-center justify-between py-2 text-gray-500 dark:text-gray-400"
                                        >
                                            <span className="flex items-center gap-2">
                                                <MapPin size={18} />
                                                Location
                                            </span>
                                            <span className="text-sm font-medium text-black dark:text-white">
                                                {user.selectedLocation || 'Set Location'}
                                            </span>
                                        </button>
                                    )}

                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                                                {user.username.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-black dark:text-white">{user.name || user.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>

                                        <Link to={`/profile/${user.username}`} className="flex items-center gap-3 py-2 text-gray-600 dark:text-gray-300" onClick={toggleMenu}>
                                            <User size={18} /> Profile
                                        </Link>
                                        <Link to="/settings" className="flex items-center gap-3 py-2 text-gray-600 dark:text-gray-300" onClick={toggleMenu}>
                                            <Settings size={18} /> Settings
                                        </Link>

                                        <button
                                            onClick={() => { logout(); toggleMenu(); }}
                                            className="flex items-center gap-3 w-full py-2 text-red-600 mt-2"
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}

                            {!user && (
                                <div className="pt-4 grid gap-3">
                                    <Link to="/login" className="py-2.5 text-center font-medium border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900" onClick={toggleMenu}>Login</Link>
                                    <Link to="/register" className="py-2.5 text-center font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200" onClick={toggleMenu}>Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Location Modal */}
            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
            />
        </>
    );
};

export default Header;
