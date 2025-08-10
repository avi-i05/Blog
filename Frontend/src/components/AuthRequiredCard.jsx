import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, LogIn, UserPlus, ArrowLeft } from 'lucide-react';

const AuthRequiredCard = ({ from }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {from === 'blogs' && "You need to be logged in to view the blog feed."}
              {from === 'create' && "You need to be logged in to create a new blog post."}
              {from === 'profile' && "You need to be logged in to view your profile."}
              {!from && "You need to be logged in to access this page."}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Link
              to="/login"
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login to your account
            </Link>

            <Link
              to="/signup"
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create new account
            </Link>

            <button
              onClick={handleBack}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthRequiredCard; 