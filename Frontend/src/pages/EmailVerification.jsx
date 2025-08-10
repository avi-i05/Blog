import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendEmailVerification } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      handleEmailVerification(token);
    } else {
      setStatus('error');
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

  const handleEmailVerification = async (token) => {
    try {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
      } else {
        if (result.error.includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleResendEmail = async () => {
    if (!email || isResending || resendCountdown > 0) return;

    setIsResending(true);
    try {
      const result = await resendEmailVerification(email);
      if (result.success) {
        setResendCountdown(60); // 60 seconds cooldown
      }
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
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

      case 'expired':
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Verification Link Expired
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The verification link has expired. Please request a new verification email.
            </p>
            {email && (
              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCountdown > 0}
                  className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  <span>
                    {resendCountdown > 0 
                      ? `Resend in ${resendCountdown}s` 
                      : 'Resend Verification Email'
                    }
                  </span>
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Didn't receive the email? Check your spam folder.
                </div>
              </div>
            )}
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
              The verification link is invalid or has expired. Please try again.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="btn-primary inline-flex items-center space-x-2"
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

export default EmailVerification; 