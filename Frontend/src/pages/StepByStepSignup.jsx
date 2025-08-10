import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Check, 
  X, 
  Phone,
  Camera,
  ArrowLeft,
  ArrowRight,
  Upload,
  Send
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import CountryCodeSelector from '../components/CountryCodeSelector';
import { getPasswordStrength } from '../utils/signupUtils';

const StepByStepSignup = () => {
  console.log('StepByStepSignup component rendering...'); // Debug log
  
  const { isDark } = useTheme();
  const { registerStepByStep, checkUsernameAvailability, sendEmailVerification, sendPhoneVerification, verifyEmailOTP, verifyPhone, autoLoginAfterRegistration } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // Verification states
  const [verificationChoice, setVerificationChoice] = useState(''); // 'email' or 'phone'
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']); // 6-digit OTP array
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationVerified, setVerificationVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    countryCode: '+91', // Default to India
    password: '',
    confirmPassword: '',
    name: '',
    bio: '',
    location: '',
    gender: '',
    socialLinks: {
      instagram: '',
      twitter: ''
    },
    profilePhoto: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = [
    { id: 1, title: 'Account Details', description: 'Enter your username, email, and phone' },
    { id: 2, title: 'Security', description: 'Create a strong password' },
    { id: 3, title: 'Profile Info', description: 'Tell us about yourself' },
    { id: 4, title: 'Profile Photo', description: 'Add a profile picture' },
    { id: 5, title: 'Create Account', description: 'Create your account' },
    { id: 6, title: 'Verification', description: 'Verify your email or phone' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset verification state when email or phone changes
    if (name === 'email' || name === 'phone') {
      setVerificationSent(false);
      setVerificationVerified(false);
      setVerificationCode(['', '', '', '', '', '']);
    }

    // Check username availability with debouncing
    if (name === 'username') {
      // Clear previous timeout
      if (window.usernameCheckTimeout) {
        clearTimeout(window.usernameCheckTimeout);
      }
      
      // Set new timeout for username check
      if (value.length >= 3) {
        window.usernameCheckTimeout = setTimeout(() => {
          checkUsernameAvailabilityLocal(value);
        }, 500); // Wait 500ms after user stops typing
      } else {
        setUsernameAvailable(null);
      }
    }
  };

  // OTP input handling functions
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...verificationCode];
    newOtp[index] = value;
    setVerificationCode(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-otp-index="${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.querySelector(`input[data-otp-index="${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setVerificationCode(newOtp);
    }
  };

  const checkUsernameAvailabilityLocal = async (username) => {
    if (username.length < 3) return;
    
    setCheckingUsername(true);
    try {
      const result = await checkUsernameAvailability(username);
      setUsernameAvailable(result.available);
    } catch (error) {
      console.error('Username check error:', error);
    } finally {
      setCheckingUsername(false);
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
        if (!formData.username.trim()) {
          newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else if (formData.username.length > 30) {
          newErrors.username = 'Username cannot be more than 30 characters';
        } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
          newErrors.username = 'Username can only contain letters, numbers, dots, and underscores';
        } else if (usernameAvailable === false) {
          newErrors.username = 'Username is already taken';
        }
        
        // Email validation
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        
        // Phone validation
        if (!formData.countryCode) {
          newErrors.countryCode = 'Country code is required';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\d+$/.test(formData.phone)) {
          newErrors.phone = 'Please enter a valid phone number (digits only)';
        }
        break;

      case 2:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 3:
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Separate validation for basic requirements (without verification completion check)
  const validateBasicRequirements = () => {
    const newErrors = {};

    if (!verificationChoice) {
      newErrors.verificationChoice = 'Please choose email or phone verification';
    } else if (verificationChoice === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else if (verificationChoice === 'phone') {
      if (!formData.countryCode) {
        newErrors.countryCode = 'Country code is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d+$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number (digits only)';
      }
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

  const handleSendVerification = async () => {
    if (!verificationChoice) {
      toast.error('Please choose a verification method');
      return;
    }

    setSendingVerification(true);
    try {
      if (verificationChoice === 'email') {
        const result = await sendEmailVerification(formData.email);
        if (result.success) {
          setVerificationSent(true);
          setErrors(prev => ({ ...prev, verification: '' })); // Clear verification error
          toast.success(`Verification email sent to ${formData.email}! Check your inbox and spam folder.`);
        } else {
          toast.error(result.error || 'Failed to send verification email');
        }
      } else if (verificationChoice === 'phone') {
        console.log('📱 Frontend sending phone verification:', {
          phone: formData.phone,
          countryCode: formData.countryCode,
          fullNumber: `${formData.countryCode}${formData.phone}`
        });
        
        const result = await sendPhoneVerification(formData.phone, formData.countryCode);
        if (result.success) {
          setVerificationSent(true);
          setErrors(prev => ({ ...prev, verification: '' })); // Clear verification error
          toast.success(`Verification SMS sent to ${formData.countryCode}${formData.phone}! Check your phone messages.`);
        } else {
          toast.error(result.error || 'Failed to send verification SMS');
        }
      }
    } catch (error) {
      console.error('Verification send error:', error);
      toast.error('Failed to send verification');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleVerifyCode = async () => {
    const otpString = verificationCode.join('');
    if (!otpString.trim() || otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setVerifyingCode(true);
    try {
      let result;
      if (verificationChoice === 'email') {
        result = await verifyEmailOTP(formData.email, otpString);
      } else {
        result = await verifyPhone(formData.phone, formData.countryCode, otpString);
      }

      if (result.success) {
        setVerificationVerified(true);
        toast.success('Verification successful! Welcome to StoryShare!');
        
        // Auto-login the user after successful verification
        const loginResult = await autoLoginAfterRegistration(formData.email, formData.password);
        if (loginResult.success) {
          // Navigate to blog feed after successful auto-login
          navigate('/blogs');
        } else {
          // If auto-login fails, still show success but user needs to login manually
          toast.error('Verification successful! Please log in to continue.');
          navigate('/login');
        }
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

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
        gender: formData.gender || '',
        socialLinks: formData.socialLinks
      };

      const result = await registerStepByStep(registrationData, formData.profilePhoto);
      
      if (result.success) {
        toast.success('Account created successfully! Now please verify your email or phone.');
        // Move to verification step instead of navigating to home
        setCurrentStep(6);
        setErrors({});
      } else {
        // Handle specific error messages
        if (result.error && result.error.includes('Too many requests')) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else {
          toast.error(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Check if it's a rate limiting error
      if (error.message && error.message.includes('Too many')) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
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
                Account Details
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your username, email, and phone number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Choose a unique username"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingUsername ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  ) : formData.username && usernameAvailable !== null ? (
                    usernameAvailable ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )
                  ) : null}
                </div>
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.username}
                </p>
              )}
              {formData.username && usernameAvailable && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  ✓ Username is available!
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <div className="flex">
                <CountryCodeSelector
                  selectedCountryCode={formData.countryCode}
                  onCountryCodeChange={(code) => {
                    setFormData(prev => ({ ...prev, countryCode: code }));
                    if (errors.countryCode) {
                      setErrors(prev => ({ ...prev, countryCode: '' }));
                    }
                  }}
                  className="rounded-r-none"
                />
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 py-3 border border-l-0 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phone}
                </p>
              )}
              {errors.countryCode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.countryCode}
                </p>
              )}
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
                Create your password
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a strong password to secure your account
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}

              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Password strength:</span>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: getPasswordStrength(formData.password).color }}
                    >
                      {getPasswordStrength(formData.password).label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(getPasswordStrength(formData.password).strength / 5) * 100}%`,
                        backgroundColor: getPasswordStrength(formData.password).color
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
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
                Tell us about yourself
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help us personalize your experience
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Social Links</h4>
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Instagram
                </label>
                <input
                  name="socialLinks.instagram"
                  type="text"
                  value={formData.socialLinks.instagram}
                  onChange={handleInputChange}
                  className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Twitter (X)
                </label>
                <input
                  name="socialLinks.twitter"
                  type="text"
                  value={formData.socialLinks.twitter}
                  onChange={handleInputChange}
                  className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="@username"
                />
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
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Create your account
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review your information and create your account
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Username:</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email:</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone:</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.countryCode}{formData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name:</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.name}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click "Create Account" to complete your registration. You'll then be able to verify your email or phone.
              </p>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verify your account
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose how you'd like to verify your account
              </p>
            </div>

            {!verificationSent && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationChoice('email');
                      setVerificationSent(false);
                      setVerificationVerified(false);
                      setVerificationCode(['', '', '', '', '', '']);
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      verificationChoice === 'email'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="w-6 h-6 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Email Verification</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Verify with your email address</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerificationChoice('phone');
                      setVerificationSent(false);
                      setVerificationVerified(false);
                      setVerificationCode(['', '', '', '', '', '']);
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      verificationChoice === 'phone'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Phone className="w-6 h-6 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Phone Verification</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Verify with SMS code</p>
                      </div>
                    </div>
                  </button>
                </div>

                {errors.verificationChoice && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.verificationChoice}
                  </p>
                )}

                {errors.verification && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.verification}
                  </p>
                )}

                {verificationChoice && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      We'll send a verification code to:
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {verificationChoice === 'email' 
                        ? formData.email 
                        : `${formData.countryCode}${formData.phone}`
                      }
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSendVerification}
                  disabled={sendingVerification || !verificationChoice}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingVerification ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </button>
              </div>
            )}

            {verificationSent && !verificationVerified && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Code *
                  </label>
                  <div className="flex justify-center space-x-2 mb-4">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        data-otp-index={index}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        onPaste={handleOtpPaste}
                        maxLength={1}
                        className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder=""
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Enter the 6-digit code sent to your {verificationChoice === 'email' ? 'email' : 'phone'}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleVerifyCode}
                    disabled={verifyingCode || verificationCode.join('').length !== 6}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingCode ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setVerificationSent(false);
                      setVerificationCode(['', '', '', '', '', '']);
                    }}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {verificationVerified && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Verification Successful!
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your {verificationChoice} has been verified. You'll be redirected to the blog feed.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              StoryShare
            </h1>
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join the community of storytellers
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {steps[currentStep - 1]?.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep === 5 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length}
                  className="flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepByStepSignup;