/**
 * Check if a user's profile is complete
 * @param {Object} user - The user object
 * @returns {Object} - Object with completion status and missing items
 */
export const checkProfileCompletion = (user) => {
  if (!user) {
    return {
      isComplete: false,
      missingItems: ['user_data'],
      completionPercentage: 0
    };
  }

  const requiredFields = [
    { field: 'name', label: 'Full Name', required: true },
    { field: 'bio', label: 'Bio', required: false },
    { field: 'location', label: 'Location', required: false },
    { field: 'avatar', label: 'Profile Photo', required: true },
    { field: 'isEmailVerified', label: 'Email Verification', required: false },
    { field: 'isPhoneVerified', label: 'Phone Verification', required: false }
  ];

  const missingItems = [];
  let completedFields = 0;
  const totalFields = requiredFields.length;

  requiredFields.forEach(({ field, label, required }) => {
    const value = user[field];

    if (required) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingItems.push(label);
      } else {
        completedFields++;
      }
    } else {
      // Optional fields still count towards completion
      if (value && (typeof value !== 'string' || value.trim() !== '')) {
        completedFields++;
      }
    }
  });

  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  const isComplete = missingItems.length === 0;

  return {
    isComplete,
    missingItems,
    completionPercentage,
    completedFields,
    totalFields
  };
};

/**
 * Get profile completion suggestions based on missing items
 * @param {Array} missingItems - Array of missing profile items
 * @returns {Array} - Array of suggestion objects
 */
export const getProfileSuggestions = (missingItems) => {
  const suggestions = [];

  missingItems.forEach(item => {
    switch (item) {
      case 'Full Name':
        suggestions.push({
          type: 'name',
          title: 'Add your full name',
          description: 'Help others identify you with your real name',
          priority: 'high'
        });
        break;
      case 'Profile Photo':
        suggestions.push({
          type: 'photo',
          title: 'Upload a profile photo',
          description: 'Add a profile picture to make your account more personal',
          priority: 'high'
        });
        break;
      case 'Email Verification':
        suggestions.push({
          type: 'email_verification',
          title: 'Verify your email',
          description: 'Verify your email address to secure your account',
          priority: 'high'
        });
        break;
      case 'Phone Verification':
        suggestions.push({
          type: 'phone_verification',
          title: 'Verify your phone number',
          description: 'Verify your phone number for additional security',
          priority: 'high'
        });
        break;
      case 'Bio':
        suggestions.push({
          type: 'bio',
          title: 'Add a bio',
          description: 'Tell others about yourself with a short bio',
          priority: 'medium'
        });
        break;
      case 'Location':
        suggestions.push({
          type: 'location',
          title: 'Add your location',
          description: 'Share where you\'re based',
          priority: 'low'
        });
        break;
    }
  });

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Get the user's profile photo URL, prioritizing avatar field
 * @param {Object} user - The user object
 * @returns {string|null} - Profile photo URL or null if not available
 */
export const getUserProfilePhoto = (user) => {
  if (!user) return null;
  return user.avatar || user.profilePhoto || null;
};

/**
 * Check if user has a profile photo
 * @param {Object} user - The user object
 * @returns {boolean} - True if user has a profile photo
 */
export const hasProfilePhoto = (user) => {
  return !!(user?.avatar || user?.profilePhoto);
}; 