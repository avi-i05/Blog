import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Check, 
  X,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkProfileCompletion, getProfileSuggestions } from '../utils/profileUtils';

const ProfileCompletionCard = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) return null;

  const profileStatus = checkProfileCompletion(user);
  
  // Don't show if profile is complete
  if (profileStatus.isComplete) return null;

  const suggestions = getProfileSuggestions(profileStatus.missingItems);

  const handleComplete = () => {
    // Navigate to profile completion page
    window.location.href = '/complete-profile';
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const getIconForSuggestion = (type) => {
    switch (type) {
      case 'name':
        return <User className="w-4 h-4" />;
      case 'photo':
        return <Camera className="w-4 h-4" />;
      case 'email_verification':
        return <Mail className="w-4 h-4" />;
      case 'phone_verification':
        return <Phone className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Edit3 className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Complete Your Profile
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profileStatus.completionPercentage}% complete
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Profile completion</span>
            <span>{profileStatus.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profileStatus.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Missing Items */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Complete these to finish your profile:
          </h4>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${getPriorityColor(suggestion.priority)}`}>
                  {getIconForSuggestion(suggestion.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </p>
                </div>
                <Check className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            {suggestions.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{suggestions.length - 3} more items to complete
              </p>
            )}
          </div>
        </div>

                 {/* Action Button */}
         <Link
           to="/complete-profile"
           className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
         >
           <span>Complete Profile Now</span>
           <ArrowRight className="w-4 h-4" />
         </Link>

        {/* Optional: Skip for now */}
        <div className="text-center mt-3">
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </motion.div>

      
    </>
  );
};

export default ProfileCompletionCard; 