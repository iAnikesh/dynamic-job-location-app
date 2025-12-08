import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    axios.defaults.withCredentials = true;

    // Check if user is logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await axios.get('/api/auth/me');
                setUser(data.user);
            } catch (error) {
                // Not logged in or session expired
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            setUser(data.user);
            toast.success(data.message || 'Login successful!');
            return data.user;
        } catch (error) {
            console.error("Login failed", error);
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post('/api/auth/register', userData);
            setUser(data.user);
            toast.success(data.message || 'Registration successful!');
            return data.user;
        } catch (error) {
            console.error("Registration failed", error);
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.get('/api/auth/logout');
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error("Logout error", error);
            // Force logout on client side even if server fails
            setUser(null);
        }
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const forgotPassword = async (email) => {
        try {
            const { data } = await axios.post('/api/auth/forgot', { email });
            toast.success(data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
            throw error;
        }
    }

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const { data } = await axios.post('/api/auth/reset', { email, otp, newPassword });
            toast.success(data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, forgotPassword, resetPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
