// admin-frontend/src/components/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    BarChart3,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const AdminLayout = ({ children }) => {
    const { admin, logout } = useAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/jobs', icon: Briefcase, label: 'Jobs' },
        { path: '/applications', icon: FileText, label: 'Applications' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Job Portal Admin
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {admin?.name || admin?.email}
                                </p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 pt-16">
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;



// // admin-frontend/src/components/AdminLayout.jsx
// import { Link, useLocation } from 'react-router-dom';
// import { useAdminAuth } from '../context/AdminAuthContext';
// import { 
//   LayoutDashboard, 
//   Users, 
//   Briefcase, 
//   FileText, 
//   TrendingUp, 
//   LogOut,
//   Menu,
//   X 
// } from 'lucide-react';
// import { useState } from 'react';

// const AdminLayout = ({ children }) => {
//   const { admin, logout } = useAdminAuth();
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const navigation = [
//     { name: 'Dashboard', href: '/', icon: LayoutDashboard },
//     { name: 'Users', href: '/users', icon: Users },
//     { name: 'Jobs', href: '/jobs', icon: Briefcase },
//     { name: 'Applications', href: '/applications', icon: FileText },
//     { name: 'Analytics', href: '/analytics', icon: TrendingUp },
//   ];

//   const isActive = (path) => {
//     if (path === '/') return location.pathname === '/';
//     return location.pathname.startsWith(path);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       {/* Mobile sidebar backdrop */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`
//         fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
//         transform transition-transform duration-200 ease-in-out lg:translate-x-0
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}>
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
//             <h1 className="text-xl font-bold text-gray-900 dark:text-white">
//               Admin Panel
//             </h1>
//             <button
//               onClick={() => setSidebarOpen(false)}
//               className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
//             {navigation.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   onClick={() => setSidebarOpen(false)}
//                   className={`
//                     flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
//                     ${isActive(item.href)
//                       ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
//                       : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                     }
//                   `}
//                 >
//                   <Icon size={20} />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Admin Info */}
//           <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
//                   <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
//                     {admin?.name?.charAt(0) || 'A'}
//                   </span>
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-900 dark:text-white">
//                     {admin?.name}
//                   </p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
//                     {admin?.role?.replace('_', ' ')}
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={logout}
//               className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
//             >
//               <LogOut size={16} />
//               Logout
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="lg:pl-64">
//         {/* Top bar */}
//         <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//           >
//             <Menu size={24} />
//           </button>
          
//           <div className="flex-1 lg:flex lg:items-center lg:justify-between">
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-white hidden lg:block">
//               {navigation.find(item => isActive(item.href))?.name || 'Admin Panel'}
//             </h2>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;