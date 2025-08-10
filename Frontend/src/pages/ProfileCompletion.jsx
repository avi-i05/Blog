import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Camera,
  Check,
  X,
  Instagram,
  Twitter,
  ArrowRight,
  Shield,
  Globe,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfilePhoto, hasProfilePhoto } from '../utils/profileUtils';
import toast from 'react-hot-toast';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { 
    user, 
    updateProfile, 
    sendEmailVerification, 
    sendPhoneVerification, 
    verifyEmailOTP, 
    verifyPhone 
  } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeCard, setActiveCard] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    socialLinks: {
      instagram: user?.socialLinks?.instagram || '',
      twitter: user?.socialLinks?.twitter || ''
    },
    profilePhoto: null
  });

  const [verificationData, setVerificationData] = useState({
    emailOTP: '',
    phoneOTP: '',
    emailVerified: user?.isEmailVerified || false,
    phoneVerified: user?.isPhoneVerified || false
  });

  const [verificationStatus, setVerificationStatus] = useState({
    email: 'idle', // idle, sending, verifying, success, error
    phone: 'idle'
  });

  const [removePhoto, setRemovePhoto] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const cards = [
    {
      id: 'profile',
      title: 'Profile Info',
      description: 'Add your name, bio, and location',
      icon: User,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      completed: formData.name && formData.name.trim() !== '',
      required: true
    },
    {
      id: 'photo',
      title: 'Profile Photo',
      description: 'Upload a profile picture (optional)',
      icon: Camera,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
      completed: true, // Always completed since we have default photo
      required: false
    },
    {
      id: 'social',
      title: 'Social Links',
      description: 'Connect your social media accounts',
      icon: Globe,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      completed: Object.values(formData.socialLinks).some(link => link.trim() !== ''),
      required: false
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'Verify your email and phone number',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      completed: verificationData.emailVerified && verificationData.phoneVerified,
      required: true
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      setRemovePhoto(false); // Reset remove photo flag when new photo is selected
      setErrors(prev => ({ ...prev, profilePhoto: '' }));
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: null }));
    setRemovePhoto(true);
    setShowPhotoOptions(false);
  };

  const handlePhotoClick = () => {
    setShowPhotoOptions(true);
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
    setShowPhotoOptions(false);
  };

  const validateCard = (cardId) => {
    const newErrors = {};

    switch (cardId) {
      case 'profile':
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        break;
      case 'photo':
        // Photo is optional, no validation needed
        break;
      case 'verification':
        if (!verificationData.emailVerified) newErrors.emailVerification = 'Email verification required';
        if (!verificationData.phoneVerified) newErrors.phoneVerification = 'Phone verification required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardClick = (card) => {
    setActiveCard(card.id);
  };

  const handleCardComplete = async (cardId) => {
    if (!validateCard(cardId)) {
      return;
    }

    setLoading(true);
    try {
      switch (cardId) {
        case 'profile':
          // Update profile info
          await updateProfile({
            name: formData.name,
            bio: formData.bio,
            location: formData.location,
            socialLinks: formData.socialLinks
          });
          break;
        case 'photo':
          // Handle photo upload
          if (formData.profilePhoto) {
            await updateProfile({}, formData.profilePhoto);
          }
          break;
        case 'verification':
          // Handle verification logic
          break;
      }
      
      // Mark card as completed
      setActiveCard(null);
      toast.success(`${cards.find(c => c.id === cardId)?.title} completed!`);
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Verification handlers
  const handleSendEmailVerification = async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return;
    }

    setVerificationStatus(prev => ({ ...prev, email: 'sending' }));
    try {
      const result = await sendEmailVerification(user.email);
      if (result.success) {
        setVerificationStatus(prev => ({ ...prev, email: 'success' }));
        toast.success('Email verification code sent!');
      } else {
        setVerificationStatus(prev => ({ ...prev, email: 'error' }));
        toast.error(result.error || 'Failed to send email verification');
      }
    } catch (error) {
      setVerificationStatus(prev => ({ ...prev, email: 'error' }));
      toast.error('Failed to send email verification');
    }
  };

  const handleSendPhoneVerification = async () => {
    if (!user?.phone) {
      toast.error('No phone number found');
      return;
    }

    setVerificationStatus(prev => ({ ...prev, phone: 'sending' }));
    try {
      const result = await sendPhoneVerification(user.phone, user.countryCode || '+1');
      if (result.success) {
        setVerificationStatus(prev => ({ ...prev, phone: 'success' }));
        toast.success('Phone verification code sent!');
      } else {
        setVerificationStatus(prev => ({ ...prev, phone: 'error' }));
        toast.error(result.error || 'Failed to send phone verification');
      }
    } catch (error) {
      setVerificationStatus(prev => ({ ...prev, phone: 'error' }));
      toast.error('Failed to send phone verification');
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationData.emailOTP || verificationData.emailOTP.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setVerificationStatus(prev => ({ ...prev, email: 'verifying' }));
    try {
      const result = await verifyEmailOTP(user.email, verificationData.emailOTP);
      if (result.success) {
        setVerificationData(prev => ({ ...prev, emailVerified: true }));
        setVerificationStatus(prev => ({ ...prev, email: 'success' }));
        toast.success('Email verified successfully!');
      } else {
        setVerificationStatus(prev => ({ ...prev, email: 'error' }));
        toast.error(result.error || 'Failed to verify email');
      }
    } catch (error) {
      setVerificationStatus(prev => ({ ...prev, email: 'error' }));
      toast.error('Failed to verify email');
    }
  };

  const handleVerifyPhone = async () => {
    if (!verificationData.phoneOTP || verificationData.phoneOTP.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setVerificationStatus(prev => ({ ...prev, phone: 'verifying' }));
    try {
      const result = await verifyPhone(user.phone, user.countryCode || '+1', verificationData.phoneOTP);
      if (result.success) {
        setVerificationData(prev => ({ ...prev, phoneVerified: true }));
        setVerificationStatus(prev => ({ ...prev, phone: 'success' }));
        toast.success('Phone verified successfully!');
      } else {
        setVerificationStatus(prev => ({ ...prev, phone: 'error' }));
        toast.error(result.error || 'Failed to verify phone');
      }
    } catch (error) {
      setVerificationStatus(prev => ({ ...prev, phone: 'error' }));
      toast.error('Failed to verify phone');
    }
  };

  const handleSubmit = async () => {
    // Check if all required cards are completed
    const requiredCards = cards.filter(card => card.required);
    const incompleteCards = requiredCards.filter(card => !card.completed);
    
    if (incompleteCards.length > 0) {
      toast.error(`Please complete: ${incompleteCards.map(card => card.title).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Prepare profile data
      const profileData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        socialLinks: formData.socialLinks
      };

      // Handle photo removal
      let photoFile = formData.profilePhoto;
      if (removePhoto) {
        // If user wants to remove photo, pass null to clear it
        photoFile = null;
        profileData.avatar = null; // Add this to explicitly remove avatar
      }

      // Update all profile data
      await updateProfile(profileData, photoFile);

      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const renderCardContent = (cardId) => {
    switch (cardId) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell us about yourself"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Where are you based?"
              />
            </div>
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="relative">
                <div
                  onClick={handlePhotoClick}
                  className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors overflow-hidden group"
                >
                  {formData.profilePhoto ? (
                    <img
                      src={URL.createObjectURL(formData.profilePhoto)}
                      alt="Profile preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : hasProfilePhoto(user) && !removePhoto ? (
                    <img
                      src={getUserProfilePhoto(user)}
                      alt="Current profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload a profile photo
                </p>
                
                {removePhoto && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Photo will be removed when you save
                  </p>
                )}
                
                {formData.profilePhoto && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Photo selected: {formData.profilePhoto.name}
                  </p>
                )}
                
                {errors.profilePhoto && (
                  <p className="text-red-500 text-sm">{errors.profilePhoto}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <input
                type="text"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your Instagram username"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter (X)
              </label>
              <input
                type="text"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your Twitter username"
              />
            </div>


          </div>
        );

      case 'verification':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Verify your email and phone number to secure your account
              </p>
              
              <div className="space-y-4">
                {/* Email Verification */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">Email Verification</span>
                    </div>
                    {verificationData.emailVerified ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <button 
                        onClick={handleSendEmailVerification}
                        disabled={verificationStatus.email === 'sending'}
                        className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {verificationStatus.email === 'sending' ? 'Sending...' : 'Send Code'}
                      </button>
                    )}
                  </div>
                  
                  {!verificationData.emailVerified && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationData.emailOTP}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, emailOTP: e.target.value }))}
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleVerifyEmail}
                        disabled={verificationStatus.email === 'verifying' || verificationData.emailOTP.length !== 6}
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium disabled:cursor-not-allowed"
                      >
                        {verificationStatus.email === 'verifying' ? 'Verifying...' : 'Verify Email'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Phone Verification */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">Phone Verification</span>
                    </div>
                    {verificationData.phoneVerified ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <button 
                        onClick={handleSendPhoneVerification}
                        disabled={verificationStatus.phone === 'sending'}
                        className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {verificationStatus.phone === 'sending' ? 'Sending...' : 'Send Code'}
                      </button>
                    )}
                  </div>
                  
                  {!verificationData.phoneVerified && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationData.phoneOTP}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, phoneOTP: e.target.value }))}
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleVerifyPhone}
                        disabled={verificationStatus.phone === 'verifying' || verificationData.phoneOTP.length !== 6}
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium disabled:cursor-not-allowed"
                      >
                        {verificationStatus.phone === 'verifying' ? 'Verifying...' : 'Verify Phone'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const completedCards = cards.filter(card => card.completed).length;
  const totalRequiredCards = cards.filter(card => card.required).length;
  const progressPercentage = Math.round((completedCards / totalRequiredCards) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          {/* Close Button */}
          <button
            onClick={() => navigate('/profile')}
            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Close and return to profile"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your profile by completing the following steps
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress: {completedCards}/{totalRequiredCards} completed
            </span>
            <span className="text-sm text-gray-500">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCardClick(card)}
              className={`relative cursor-pointer group transition-all duration-200 ${
                activeCard === card.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className={`${card.bgColor} ${card.borderColor} border rounded-xl p-6 h-full hover:shadow-lg transition-all duration-200`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color} text-white`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  {card.completed && (
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {card.description}
                </p>

                {card.required && (
                  <span className="inline-block px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-full">
                    Required
                  </span>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {card.completed ? 'Completed' : 'Not completed'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Card Content Modal */}
        {activeCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {cards.find(c => c.id === activeCard)?.title}
                  </h2>
                  <button
                    onClick={() => setActiveCard(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {renderCardContent(activeCard)}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveCard(null)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCardComplete(activeCard)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Saving...' : 'Complete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={handleSubmit}
            disabled={loading || progressPercentage < 100}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Updating Profile...' : 'Update Profile'}
          </button>
          {progressPercentage < 100 && (
            <p className="text-sm text-gray-500 mt-2">
              Complete all required steps to update your profile
            </p>
          )}
        </motion.div>

        {/* Photo Options Modal */}
        {showPhotoOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Photo
                  </h3>
                  <button
                    onClick={() => setShowPhotoOptions(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleChangePhoto}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Change Photo</span>
                  </button>

                  {(hasProfilePhoto(user) || formData.profilePhoto) && (
                    <button
                      onClick={handleRemovePhoto}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Remove Photo</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowPhotoOptions(false)}
                    className="w-full px-4 py-3 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletion; 