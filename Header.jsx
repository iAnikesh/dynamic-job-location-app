import { useEffect, useState } from "react";
import { Menu, X, Briefcase, Search, Bell, User, ChevronDown, MapPin, Settings, LogOut } from 'lucide-react';
import {useNavigate } from 'react-router-dom';

export default function Header() {
    const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("isLogin");
    setIsLogin(cached === "true");
  }, []);
  return (
    <>
      {isLogin ? <LogedinHeader /> : <NormalHeader />}
    </>
  );
}


function NormalHeader() {
    const navigate = useNavigate();

return (
  <header className="w-screen bg-white text-black shadow-sm top-0 m-0">
    <div className="w-full flex items-center justify-between px-6 py-4">

      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src="/hiree.png"
          alt="logo"
          className="h-10 w-30 object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <button
          onClick={() => navigate("/")}
          className="hover:text-blue-600 transition"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/job-search")}
          className="hover:text-blue-600 transition"
        >
          Jobs
        </button>
        <button
          onClick={() => navigate("/recruiters")}
          className="hover:text-blue-600 transition"
        >
          Recruiters
        </button>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded border border-gray-300 hover:border-black transition"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition"
        >
          Sign Up
        </button>
      </div>

    </div> 
  </header>
);
}

function LogedinHeader(){
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    role: "Job Seeker",
    avatar: "JD"
  };

  const notifications = [
    { id: 1, text: "New job match: Senior Developer", time: "5m ago", unread: true },
    { id: 2, text: "Application viewed by TechCorp", time: "1h ago", unread: true },
    { id: 3, text: "Interview scheduled for tomorrow", time: "2h ago", unread: false },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-screen ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Briefcase className="text-white" size={22} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  JobTracker
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">Find jobs nearby</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <a href="#" className="px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-medium">
                Dashboard
              </a>
              <a href="#" className="px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-medium">
                Browse Jobs
              </a>
              <a href="#" className="px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-medium">
                Applications
              </a>
              <a href="#" className="px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-medium">
                Messages
              </a>
            </nav>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Location Button */}
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
              <MapPin size={18} />
              <span className="text-sm font-medium">New York</span>
              <ChevronDown size={16} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <p className="text-xs text-gray-500 mt-0.5">You have 2 unread notifications</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                          notif.unread ? 'border-indigo-500 bg-indigo-50/30' : 'border-transparent'
                        }`}
                      >
                        <p className="text-sm text-gray-900">{notif.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>


            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 pl-3 pr-2 py-1.5 hover:bg-gray-50 rounded-xl transition-all"
              >
                <div className="hidden xl:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-md">
                  {user.avatar}
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <a href="#" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-all">
                      <User size={18} />
                      <span className="text-sm font-medium">Your Profile</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-all">
                      <Settings size={18} />
                      <span className="text-sm font-medium">Settings</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-all">
                      <Bell size={18} />
                      <span className="text-sm font-medium">Notifications</span>
                    </a>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <button className="flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all w-full">
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            <a href="#" className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-all">
              Dashboard
            </a>
            <a href="#" className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-all">
              Browse Jobs
            </a>
            <a href="#" className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-all">
              Applications
            </a>
            <a href="#" className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-all">
              Messages
            </a>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  {user.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
              <a href="#" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
                Profile Settings
              </a>
              <button className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}