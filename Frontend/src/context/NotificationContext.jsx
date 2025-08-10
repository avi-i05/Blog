import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getRecentActivity } from '../services/userService';
import { useAuth } from './AuthContext';

// Context for notification/activity dot state
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [hasNotification, setHasNotification] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [latestActivity, setLatestActivity] = useState(null);

  // Key for localStorage
  const LS_KEY = user ? `activity_last_seen_${user._id}` : null;

  // Fetch recent activity and update notification state
  const fetchActivity = useCallback(async () => {
    if (!user) return;
    const res = await getRecentActivity(user._id);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const latest = res.data[0];
      setLatestActivity(latest);
      const lastSeen = localStorage.getItem(LS_KEY);
      if (!lastSeen || new Date(latest.createdAt) > new Date(lastSeen)) {
        setHasNotification(true);
      } else {
        setHasNotification(false);
      }
    } else {
      setHasNotification(false);
    }
  }, [user, LS_KEY]);

  // On login/site load, fetch activity
  useEffect(() => {
    if (user) {
      fetchActivity();
    } else {
      setHasNotification(false);
    }
    // eslint-disable-next-line
  }, [user]);

  // Mark activity as seen (called when Activity modal is opened)
  const markActivitySeen = () => {
    if (user && latestActivity) {
      localStorage.setItem(LS_KEY, latestActivity.createdAt);
      setHasNotification(false);
    }
  };

  return (
    <NotificationContext.Provider value={{ hasNotification, fetchActivity, markActivitySeen }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
