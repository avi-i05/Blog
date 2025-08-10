import { useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  Check,
  X,
  Edit3,
  Save,
  Instagram,
  Twitter,
  Linkedin,
  Plus,
  Upload,
  AlertCircle,
  ArrowRight,
  Shield,
  MapPin,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CountryCodeSelector from '../components/CountryCodeSelector';
import toast from 'react-hot-toast';

const CardBasedSignup = () => {
  const navigate = useNavigate();
  const { registerStepByStep, checkUsernameAvailability } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeCard, setActiveCard] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    countryCode: '+91',
    password: '',
    confirmPassword: '',
    name: '',
    bio: '',
    location: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    profilePhoto: null
  });

  const [verificationData] = useState({
    emailOTP: '',
    phoneOTP: '',
    emailVerified: false,
    phoneVerified: false
  });

  const cards = [
    {
      id: 'account',
      title: 'Account Details',
      description: 'Set up your username and basic account info',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      completed: formData.username && formData.email && formData.phone,
      required: true
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Create a strong password for your account',
      icon: Lock,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      completed: formData.password && formData.password === formData.confirmPassword,
      required: true
    },
    {
      id: 'profile',
      title: 'Profile Info',
      description: 'Add your name, bio, and location',
      icon: User,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      completed: formData.name,
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
  
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      setErrors(prev => ({ ...prev, profilePhoto: '' }));
    }
  };

  const validateCard = (cardId) => {
    const newErrors = {};

    switch (cardId) {
      case 'account':
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        break;
      case 'security':
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
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
        case 'account': {
          // Check username availability
          const isAvailable = await checkUsernameAvailability(formData.username);
          if (!isAvailable) {
            setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
            setLoading(false);
            return;
          }
          break;
        }
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
      const registrationData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        password: formData.password,
        name: formData.name,
        bio: formData.bio || '',
        location: formData.location || '',
        socialLinks: formData.socialLinks
      };

             const result = await registerStepByStep(registrationData, formData.profilePhoto || null);
      
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderCardContent = (cardId) => {
    switch (cardId) {
      case 'account':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Choose a username"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <CountryCodeSelector
                  value={formData.countryCode}
                  onChange={(value) => setFormData(prev => ({ ...prev, countryCode: value }))}
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Create a strong password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

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
               <div
                 onClick={() => fileInputRef.current?.click()}
                 className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors overflow-hidden"
               >
                 {formData.profilePhoto ? (
                   <img
                     src={URL.createObjectURL(formData.profilePhoto)}
                     alt="Profile preview"
                     className="w-full h-full rounded-full object-cover"
                   />
                 ) : (
                   <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                     <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                       <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                     </div>
                   </div>
                 )}
               </div>
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 onChange={handleFileChange}
                 className="hidden"
               />
               <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                 Click to upload a profile photo
               </p>
               {errors.profilePhoto && <p className="text-red-500 text-sm mt-1">{errors.profilePhoto}</p>}
               {formData.profilePhoto && (
                 <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                   Photo selected: {formData.profilePhoto.name}
                 </p>
               )}
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
                Twitter
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

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </label>
              <input
                type="text"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your LinkedIn profile URL"
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
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium">Email Verification</span>
                  </div>
                  {verificationData.emailVerified ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <button className="text-sm text-blue-600 hover:text-blue-700">Verify</button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium">Phone Verification</span>
                  </div>
                  {verificationData.phoneVerified ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <button className="text-sm text-blue-600 hover:text-blue-700">Verify</button>
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
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your account by completing the following steps
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          {progressPercentage < 100 && (
            <p className="text-sm text-gray-500 mt-2">
              Complete all required steps to create your account
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CardBasedSignup; 