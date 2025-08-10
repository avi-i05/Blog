import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/messageService';

const MessageButton = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const result = await getUnreadCount();
      if (result.success) {
        setUnreadCount(result.data);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link to="/messages" className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>
    </Link>
  );
};

export default MessageButton; 