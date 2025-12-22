import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Lock, Mail, User, Calendar, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user, reloadUser } = useAuth();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [emailData, setEmailData] = useState({
        newEmail: '',
        otp: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [emailStep, setEmailStep] = useState('input'); // 'input' or 'verify'
    const [requestingEmail, setRequestingEmail] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        setChangingPassword(true);
        try {
            await axios.post('/api/user/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            reloadUser();
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleRequestEmailChange = async (e) => {
        e.preventDefault();

        if (!emailData.newEmail) {
            toast.error('Please enter a new email address');
            return;
        }

        setRequestingEmail(true);
        try {
            await axios.post('/api/user/request-email-change', {
                newEmail: emailData.newEmail
            });

            toast.success('Verification code sent to your new email');
            setEmailStep('verify');
        } catch (error) {
            console.error('Request email change error:', error);
            toast.error(error.response?.data?.message || 'Failed to send verification code');
        } finally {
            setRequestingEmail(false);
        }
    };

    const handleVerifyEmailChange = async (e) => {
        e.preventDefault();

        if (!emailData.otp) {
            toast.error('Please enter the verification code');
            return;
        }

        setVerifyingEmail(true);
        try {
            const response = await axios.post('/api/user/verify-email-change', {
                otp: emailData.otp
            });

            toast.success('Email changed successfully!');
            setEmailData({ newEmail: '', otp: '' });
            setEmailStep('input');
            reloadUser();
        } catch (error) {
            console.error('Verify email change error:', error);
            toast.error(error.response?.data?.message || 'Failed to verify code');
        } finally {
            setVerifyingEmail(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '' };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

        return { strength, label: labels[strength - 1] || '', color: colors[strength - 1] || '' };
    };

    const passwordStrength = getPasswordStrength(passwordData.newPassword);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
                    Account Settings
                </h1>

                {/* Account Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                        <User size={24} />
                        Account Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Username
                            </label>
                            <p className="text-black dark:text-white font-medium">{user?.username}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Email
                            </label>
                            <p className="text-black dark:text-white font-medium">{user?.email}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Role
                            </label>
                            <p className="text-black dark:text-white font-medium capitalize">{user?.role}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Member Since
                            </label>
                            <p className="text-black dark:text-white font-medium">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Last Updated
                            </label>
                            <p className="text-black dark:text-white font-medium">
                                {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                        <Lock size={24} />
                        Change Password
                    </h2>

                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Current Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword.current ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
                                >
                                    {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                New Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
                                >
                                    {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {passwordData.newPassword && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[80px]">
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Confirm New Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
                                >
                                    {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {changingPassword ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Change Email */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                        <Mail size={24} />
                        Change Email
                    </h2>

                    {emailStep === 'input' ? (
                        <form onSubmit={handleRequestEmailChange} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    New Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={emailData.newEmail}
                                    onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                    placeholder="newemail@example.com"
                                    required
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    We'll send a verification code to this email address
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={requestingEmail}
                                className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {requestingEmail ? 'Sending Code...' : 'Send Verification Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyEmailChange} className="space-y-4 max-w-md">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    A verification code has been sent to <strong>{emailData.newEmail}</strong>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Verification Code *
                                </label>
                                <input
                                    type="text"
                                    value={emailData.otp}
                                    onChange={(e) => setEmailData({ ...emailData, otp: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Code expires in 10 minutes
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmailStep('input');
                                        setEmailData({ ...emailData, otp: '' });
                                    }}
                                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifyingEmail}
                                    className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {verifyingEmail ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
