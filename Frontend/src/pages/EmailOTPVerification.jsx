import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  AlertCircle,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EmailOTPVerification = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmailOTP, resendEmailOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('input'); // input, verifying, success, error
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let interval;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleVerifyEmailOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (!email || otpString.length !== 6 || isVerifying) return;

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyEmailOTP(email, otpString);
      if (result.success) {
        setStatus('success');
      } else {
        setError(result.error || 'Verification failed');
        setStatus('error');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      setStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || isResending || resendCountdown > 0) return;

    setIsResending(true);
    setError('');

    try {
      const result = await resendEmailOTP(email);
      if (result.success) {
        setResendCountdown(60); // 60 seconds cooldown
        setStatus('input');
        // Clear OTP fields
        setOtp(['', '', '', '', '', '']);
        // Focus first input
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'input':
        return (
          <div>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Verify Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the 6-digit code sent to your email address
              </p>
            </div>

            <form onSubmit={handleVerifyEmailOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={!email || otp.join('').length !== 6 || isVerifying}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify Email'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!email || isResending || resendCountdown > 0}
                  className="w-full btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <span>
                      {resendCountdown > 0 
                        ? `Resend in ${resendCountdown}s` 
                        : 'Resend Code'
                      }
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 'verifying':
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Verifying Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your email address has been verified. You can now access all features of StoryShare.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Continue to Login</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || 'The verification code is invalid. Please try again.'}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setStatus('input')}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Try Again</span>
                <RefreshCw className="h-4 w-4" />
              </button>
              <Link
                to="/login"
                className="btn-outline inline-flex items-center space-x-2"
              >
                <span>Go to Login</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                StoryShare
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Email Verification
            </h1>
          </div>

          {/* Content */}
          {renderContent()}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Need help? Contact our support team</p>
              <a 
                href="mailto:support@storyshare.com" 
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                support@storyshare.com
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailOTPVerification; 