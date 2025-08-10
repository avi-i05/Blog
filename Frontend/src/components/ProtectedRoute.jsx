import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthRequiredCard from './AuthRequiredCard';

const ProtectedRoute = ({ children, from }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, show auth required card
  if (!user) {
    return <AuthRequiredCard from={from} />;
  }

  // If user is authenticated, render the protected content
  return children;
};

export default ProtectedRoute; 