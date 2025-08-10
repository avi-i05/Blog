import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    phoneVerified: false,
    fullyVerified: false
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setVerificationStatus({
          emailVerified: data.data.isEmailVerified,
          phoneVerified: data.data.isPhoneVerified,
          fullyVerified: data.data.isEmailVerified && data.data.isPhoneVerified
        });
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please check your email and phone for verification.');
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || 'Registration failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const registerStepByStep = async (userData, profilePhoto = null) => {
    try {
      console.log('Starting registration with data:', userData);
      const formData = new FormData();
      
      // Add all user data to FormData
      Object.keys(userData).forEach(key => {
        if (key === 'socialLinks') {
          formData.append(key, JSON.stringify(userData[key]));
        } else {
          formData.append(key, userData[key]);
        }
      });
      
      // Add profile photo if provided
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      console.log('FormData prepared, sending request to:', `${API_BASE_URL}/auth/register-step`);

      const response = await fetch(`${API_BASE_URL}/auth/register-step`, {
        method: 'POST',
        body: formData // Don't set Content-Type header, let browser set it with boundary
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success('Registration successful! Please check your email and phone for verification.');
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || 'Registration failed';
        console.error('Registration failed:', errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Step-by-step registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verified successfully!');
        setVerificationStatus(prev => ({
          ...prev,
          emailVerified: true,
          fullyVerified: prev.phoneVerified
        }));
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || 'Email verification failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error('Email verification failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const verifyPhone = async (phone, countryCode, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, countryCode, otp })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Phone verified successfully!');
        setVerificationStatus(prev => ({
          ...prev,
          phoneVerified: true,
          fullyVerified: prev.emailVerified
        }));
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || 'Phone verification failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      toast.error('Phone verification failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const resendEmailVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verification sent successfully!');
        return { success: true };
      } else {
        const errorMessage = data.message || 'Failed to resend email verification';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Resend email verification error:', error);
      toast.error('Failed to resend email verification. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const resendPhoneVerification = async (phone, countryCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-phone-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, countryCode })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Phone verification OTP sent successfully!');
        return { success: true };
      } else {
        const errorMessage = data.message || 'Failed to resend phone verification';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Resend phone verification error:', error);
      toast.error('Failed to resend phone verification. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const login = async (identifier, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        // If response is not JSON (likely rate limit)
        if (response.status === 429) {
          toast.error('Too many login attempts. Please wait and try again.');
          return { success: false, error: 'Too many login attempts. Please wait and try again.' };
        } else {
          toast.error('Unexpected error during login.');
          return { success: false, error: 'Unexpected error during login.' };
        }
      }

      if (response.ok) {
        const { token, user: userData } = data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setVerificationStatus({
          emailVerified: userData.isEmailVerified,
          phoneVerified: userData.isPhoneVerified,
          fullyVerified: userData.isEmailVerified && userData.isPhoneVerified
        });

        toast.success('Login successful!');
        return { success: true, user: userData };
      } else {
        const errorMessage = data.message || 'Login failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset email sent successfully!');
        return { success: true };
      } else {
        const errorMessage = data.message || 'Failed to send password reset email';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send password reset email. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully!');
        return { success: true };
      } else {
        const errorMessage = data.message || 'Password reset failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Password reset failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates, profilePhoto = null) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('updateProfile called with:', { updates, profilePhoto });
      console.log('Token available:', !!token);
      
      let response;
      
      if (profilePhoto) {
        // Handle file upload with FormData
        const formData = new FormData();
        
        // Add all text fields
        Object.keys(updates).forEach(key => {
          if (updates[key] !== null && updates[key] !== undefined) {
            formData.append(key, updates[key]);
          }
        });
        
        // Add profile photo as 'profilePhoto' (backend expects this field name)
        formData.append('profilePhoto', profilePhoto);
        
        console.log('Sending FormData with profile photo');
        
        response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
          body: formData
        });
      } else {
        // Handle regular JSON update
        response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
      }

      const data = await response.json();
      
      console.log('Profile update response:', { 
        status: response.status, 
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const updatedUser = { ...user, ...data.data };
        console.log('Updated user object:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
        return { success: true, user: updatedUser };
      } else {
        const errorMessage = data.message || 'Profile update failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profile update failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        const { token: newToken, user: userData } = data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        const errorMessage = data.message || 'Password change failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Password change failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setVerificationStatus({
        emailVerified: false,
        phoneVerified: false,
        fullyVerified: false
      });
      toast.success('Logged out successfully!');
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-username/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, available: data.data.available };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Username check error:', error);
      return { success: false, error: 'Failed to check username availability' };
    }
  };

  const searchUsers = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/search-users?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, users: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('User search error:', error);
      return { success: false, error: 'Failed to search users' };
    }
  };

  // New verification methods for step-by-step signup
  const sendEmailVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Send email verification error:', error);
      return { success: false, error: 'Failed to send email verification' };
    }
  };

  const sendPhoneVerification = async (phone, countryCode) => {
    try {
      console.log('📱 AuthContext sending phone verification:', { phone, countryCode });
      
      const response = await fetch(`${API_BASE_URL}/auth/send-phone-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, countryCode })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Send phone verification error:', error);
      return { success: false, error: 'Failed to send phone verification' };
    }
  };

  // Email OTP verification functions
  const verifyEmailOTP = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verified successfully!');
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Email OTP verification error:', error);
      return { success: false, error: 'Failed to verify email' };
    }
  };

  const resendEmailOTP = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verification code sent successfully!');
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Resend email OTP error:', error);
      return { success: false, error: 'Failed to resend verification code' };
    }
  };

  // Auto login after registration
  const autoLoginAfterRegistration = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier: email, password })
      });

      const data = await response.json();

      if (response.ok) {
        const { token, user: userData } = data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setVerificationStatus({
          emailVerified: userData.isEmailVerified,
          phoneVerified: userData.isPhoneVerified,
          fullyVerified: userData.isEmailVerified && userData.isPhoneVerified
        });

        toast.success('Welcome! You are now logged in.');
        return { success: true, user: userData };
      } else {
        const errorMessage = data.message || 'Auto-login failed';
        console.error('Auto-login error:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      return { success: false, error: 'Auto-login failed. Please log in manually.' };
    }
  };

  const value = {
    user,
    loading,
    verificationStatus,
    register,
    registerStepByStep,
    verifyEmail,
    verifyPhone,
    verifyEmailOTP,
    resendEmailVerification,
    resendPhoneVerification,
    resendEmailOTP,
    sendEmailVerification,
    sendPhoneVerification,
    login,
    autoLoginAfterRegistration,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    logout,
    checkUsernameAvailability,
    searchUsers,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 