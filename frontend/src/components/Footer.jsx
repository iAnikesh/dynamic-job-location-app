import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';
import Logo from '/hiree.work.png';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="inline-block mb-4">
                            <img src={Logo} alt="Logo" className="w-32 h-5" />
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md">
                            Connect job seekers with opportunities and help recruiters find the perfect candidates.
                            Your career journey starts here.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Github size={20} />
                            </a>
                            <a
                                href="mailto:contact@hiree.work"
                                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-black dark:text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/jobs" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                                    Find Jobs
                                </Link>
                            </li>
                            <li>
                                <Link to="/post-job" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                                    Post a Job
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-black dark:text-white mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/settings" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                                    Account Settings
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            © {new Date().getFullYear()} Hiree.work. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin size={16} />
                            <span>Made with ❤️ for job seekers worldwide</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
