import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        let newSocket;

        if (user) {
            // Connect to socket
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            console.log('🔌 Attempting socket connection to:', socketUrl);

            newSocket = io(socketUrl, {
                withCredentials: true
            });

            newSocket.on('connect', () => {
                console.log('✅ Connected to socket server. Socket ID:', newSocket.id);
                console.log('Joining room for user:', user._id);
                newSocket.emit('join', user._id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Socket Connection Error:', err);
            });

            newSocket.on('notification', (notification) => {
                console.log('📩 Received notification:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show toast
                toast((t) => (
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">{notification.title}</span>
                        <span className="text-sm">{notification.message}</span>
                    </div>
                ), {
                    duration: 5000,
                    position: 'top-right',
                    icon: '🔔'
                });
            });

            setSocket(newSocket);

            // Fetch initial notifications
            fetchNotifications();
        }

        return () => {
            if (newSocket) newSocket.close();
        };
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/api/notifications');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};
