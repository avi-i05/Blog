import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Check, 
  X, 
  Edit3, 
  Save,
  Instagram,
  Twitter,
  Plus,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileCompletion = ({ onComplete }) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
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

  // Update form data when user data changes
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      socialLinks: {
        instagram: user?.socialLinks?.instagram || '',
        twitter: user?.socialLinks?.twitter || ''
      },
      profilePhoto: null
    });
  }, [user]);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Add your name and bio' },
    { id: 2, title: 'Profile Photo', description: 'Upload a profile picture' },
    { id: 3, title: 'Social Links', description: 'Connect your social accounts (optional)' },
    { id: 4, title: 'Complete', description: 'Finish your profile setup' }
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

    // Clear errors when user types
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
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }
        break;
      case 2:
        if (!formData.profilePhoto) {
          newErrors.profilePhoto = 'Profile photo is required';
        }
        break;
      case 3:
        // Social links are optional - no validation needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        socialLinks: formData.socialLinks
      };

      const result = await updateProfile(updateData, formData.profilePhoto);
      
      if (result.success) {
        toast.success('Profile completed successfully!');
        if (onComplete) {
          onComplete();
        }
      } else {
        toast.error(result.error || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Tell us about yourself
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help others get to know you better
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
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
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Where are you based?"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Add a profile photo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help others recognize you with a profile picture
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {formData.profilePhoto ? (
                    <img
                      src={URL.createObjectURL(formData.profilePhoto)}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Click the camera icon to upload a photo
              </p>
              {errors.profilePhoto && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.profilePhoto}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
                         <div>
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                 Connect your social accounts
               </h3>
               <p className="text-gray-600 dark:text-gray-400">
                 Share your Twitter (X) and Instagram profiles (optional)
               </p>
             </div>

                         <div className="space-y-4">
               {(formData.socialLinks.instagram || formData.socialLinks.twitter) && (
                 <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                   <p className="text-sm text-blue-700 dark:text-blue-300">
                     You already have some social links filled from signup. You can update them here or leave them as is.
                   </p>
                 </div>
               )}
               
               <div>
                 <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                   Instagram
                 </label>
                 <div className="relative">
                   <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                   <input
                     name="socialLinks.instagram"
                     type="text"
                     value={formData.socialLinks.instagram}
                     onChange={handleInputChange}
                     className="w-full pl-10 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                     placeholder="@username"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                   Twitter (X)
                 </label>
                 <div className="relative">
                   <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                   <input
                     name="socialLinks.twitter"
                     type="text"
                     value={formData.socialLinks.twitter}
                     onChange={handleInputChange}
                     className="w-full pl-10 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                     placeholder="@username"
                   />
                 </div>
               </div>

             </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Complete your profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review your information and complete your profile
              </p>
            </div>

                         <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
               <div>
                 <p className="text-sm text-gray-600 dark:text-gray-400">Name:</p>
                 <p className="font-medium text-gray-900 dark:text-white">{formData.name}</p>
               </div>
               {formData.bio && (
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Bio:</p>
                   <p className="font-medium text-gray-900 dark:text-white">{formData.bio}</p>
                 </div>
               )}
               {formData.location && (
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Location:</p>
                   <p className="font-medium text-gray-900 dark:text-white">{formData.location}</p>
                 </div>
               )}
               {formData.profilePhoto && (
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Profile Photo:</p>
                   <p className="font-medium text-green-600 dark:text-green-400">✓ Uploaded</p>
                 </div>
               )}
               {(formData.socialLinks.instagram || formData.socialLinks.twitter) && (
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Social Links:</p>
                   <div className="space-y-1">
                     {formData.socialLinks.instagram && (
                       <p className="font-medium text-gray-900 dark:text-white">• Instagram: @{formData.socialLinks.instagram}</p>
                     )}
                     {formData.socialLinks.twitter && (
                       <p className="font-medium text-gray-900 dark:text-white">• Twitter (X): @{formData.socialLinks.twitter}</p>
                     )}
                   </div>
                 </div>
               )}
             </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click "Complete Profile" to finish your setup and start sharing stories!
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Complete Your Profile
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-1 mx-1 ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep === steps.length ? (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Complete Profile
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCompletion; 