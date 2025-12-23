// admin-frontend/src/context/AdminAuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.baseURL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5001';
    axios.defaults.withCredentials = true;

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const { data } = await axios.get('/api/admin/auth/me');
            setAdmin(data.admin);
        } catch (error) {
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/admin/auth/login', { email, password });
            setAdmin(data.admin);
            toast.success('Welcome back!');
            return data.admin;
        } catch (error) {
            console.error("Login failed", error);
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.get('/api/admin/auth/logout');
            setAdmin(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error("Logout error", error);
            setAdmin(null);
        }
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
};