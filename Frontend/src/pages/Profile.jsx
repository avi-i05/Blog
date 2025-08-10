import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  Camera,
  BookOpen,
  Heart,
  Eye,
  TrendingUp,
  Settings,
  Globe,
  Twitter,
  Instagram,
  Plus,
  Trash2,
  Lock,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserStats, getUserBlogs, getUserFollowers, getUserFollowing, getRecentActivity } from '../services/userService';
import FollowersFollowingModal from '../components/FollowersFollowingModal';
import ActivityModal from '../components/ActivityModal';
import { deleteBlog } from '../services/blogService';

import toast from 'react-hot-toast';

// Simple profile completion check since profileUtils.js was deleted
const checkProfileCompletion = (user) => {
  if (!user) {
    return { isComplete: false };
  }
  
  // Check ALL fields for 100% completion
  const hasName = user.name && user.name.trim() !== '';
  const hasBio = user.bio && user.bio.trim() !== '';
  const hasLocation = user.location && user.location.trim() !== '';
  const hasAvatar = user.avatar || user.profilePhoto;
  const hasEmailVerification = user.isEmailVerified;
  const hasPhoneVerification = user.isPhoneVerified;
  
  // Check social links (only Twitter and Instagram)
  const hasTwitter = user.socialLinks?.twitter && user.socialLinks.twitter.trim() !== '';
  const hasInstagram = user.socialLinks?.instagram && user.socialLinks.instagram.trim() !== '';
  
  // Profile is complete ONLY if ALL fields are filled (100% completion)
  const isComplete = hasName && hasBio && hasLocation && hasAvatar && 
                    hasEmailVerification && hasPhoneVerification && 
                    hasTwitter && hasInstagram;
  
  return {
    isComplete,
    missingItems: []
  };
};

const getUserProfilePhoto = (user) => {
  if (!user) return null;
  return user.avatar || user.profilePhoto || null;
};

const hasProfilePhoto = (user) => {
  return !!(user?.avatar || user?.profilePhoto);
};

import { useRef } from 'react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Modal state for followers/following
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  const handleShowFollowers = async () => {
    setShowFollowersModal(true);
    setFollowersLoading(true);
    try {
      const res = await getUserFollowers(user._id, 1, 50);
      setFollowersList(res.success ? res.data : []);
    } catch (e) {
      setFollowersList([]);
    } finally {
      setFollowersLoading(false);
    }
  };
  const handleShowFollowing = async () => {
    setShowFollowingModal(true);
    setFollowingLoading(true);
    try {
      const res = await getUserFollowing(user._id, 1, 50);
      setFollowingList(res.success ? res.data : []);
    } catch (e) {
      setFollowingList([]);
    } finally {
      setFollowingLoading(false);
    }
  };
  const handleCloseFollowers = () => setShowFollowersModal(false);
  const handleCloseFollowing = () => setShowFollowingModal(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [userStats, setUserStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    totalViews: 0,
    totalLikes: 0,
    avgReadTime: '0 min'
  });
  const [userBlogs, setUserBlogs] = useState([]);
const [deleteLoadingId, setDeleteLoadingId] = useState(null);
const [deleteError, setDeleteError] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [blogToDelete, setBlogToDelete] = useState(null);
const [editLoadingId, setEditLoadingId] = useState(null);
const editNavigating = useRef(false);
  const [loading, setLoading] = useState(true);
  
  // Check profile completion
  const profileCompletion = checkProfileCompletion(user);
  const showProfileCompletion = !profileCompletion.isComplete;
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    gender: user?.gender || '',
    twitter: user?.socialLinks?.twitter || '',
    instagram: user?.socialLinks?.instagram || ''
  });

  // Blog card actions
  const handleOpenBlog = (blog) => {
    navigate(`/blog/${blog.slug || blog._id}`);
  };

  const handleEditBlog = (blog) => {
  if (editNavigating.current) return;
  editNavigating.current = true;
  setEditLoadingId(blog._id);
  const navTarget = `/edit-blog/${blog.slug || blog._id}`;
  console.log('Navigating to edit:', navTarget, 'with blog:', blog);
  navigate(navTarget);
  setTimeout(() => { // reset after navigation
    setEditLoadingId(null);
    editNavigating.current = false;
  }, 2000);
};

  const handleDeleteBlog = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const confirmDeleteBlog = async () => {
  if (!blogToDelete) return;
  setDeleteLoadingId(blogToDelete._id);
  setDeleteError(null);
  try {
    console.log('Attempting to delete blog:', blogToDelete);
    const result = await deleteBlog(blogToDelete._id);
    console.log('Delete blog result:', result);
    if (result.success) {
      setUserBlogs(prev => prev.filter(b => b._id !== blogToDelete._id));
      toast.success('Blog deleted successfully!');
      setShowDeleteModal(false);
      setBlogToDelete(null);
    } else {
      setDeleteError(result.error || 'Failed to delete blog');
      toast.error(result.error || 'Failed to delete blog');
    }
  } catch (error) {
    setDeleteError(error?.message || 'Failed to delete blog');
    toast.error(error?.message || 'Failed to delete blog');
    console.error('Delete blog exception:', error);
  } finally {
    setDeleteLoadingId(null);
  }
};

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
    setDeleteError(null);
  };

  // Fetch user data
  useEffect(() => {
    if (user?._id) {
      fetchUserData();
    }
  }, [user?._id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user stats
      const statsResult = await getUserStats(user._id);
      if (statsResult.success) {
        // Map backend keys to frontend keys for compatibility
        const stats = statsResult.data;
        setUserStats(prev => ({
          ...prev,
          posts: stats.blogsCount ?? 0,
          followers: stats.followersCount ?? 0,
          following: stats.followingCount ?? 0
        }));
      }

      // Fetch user blogs
      const blogsResult = await getUserBlogs(user._id, { limit: 5 });
      if (blogsResult.success) {
        setUserBlogs(blogsResult.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      gender: user?.gender || '',
      twitter: user?.socialLinks?.twitter || '',
      instagram: user?.socialLinks?.instagram || ''
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Format the data to match backend expectations
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        gender: formData.gender,
        socialLinks: {
          twitter: formData.twitter,
          instagram: formData.instagram
        }
      };

      const result = await updateProfile(updateData);
      if (result.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      gender: user?.gender || '',
      twitter: user?.socialLinks?.twitter || '',
      instagram: user?.socialLinks?.instagram || ''
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Starting avatar upload with file:', file);

    setIsUploading(true);
    try {
      // Call updateProfile with the file
      const result = await updateProfile({}, file);
      console.log('Update profile result:', result);
      
      if (result.success) {
        toast.success('Avatar updated successfully!');
      } else {
        console.error('Profile update failed:', result.error);
        toast.error(result.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!hasProfilePhoto(user)) return;
    
    setIsUploading(true);
    try {
      const result = await updateProfile({ avatar: null }, null);
      if (result.success) {
        toast.success('Profile photo removed successfully!');
        setShowPhotoOptions(false);
      } else {
        toast.error(result.error || 'Failed to remove profile photo');
      }
    } catch (error) {
      console.error('Error removing profile photo:', error);
      toast.error('Failed to remove profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoClick = () => {
    setShowPhotoOptions(true);
  };

  const handleChangePhoto = () => {
    document.getElementById('avatar-upload').click();
    setShowPhotoOptions(false);
  };

  const handleNewPost = () => {
    navigate('/create');
  };

  const handleCreateFirstPost = () => {
    navigate('/create');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show ProfileCompletion component - we'll show it as a section instead

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Completion Section - Show only if profile is incomplete */}
        {showProfileCompletion && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Complete Your Profile
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add missing information to complete your profile setup
                    </p>
                  </div>
                </div>
                <Link
                  to="/complete-profile"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Complete Now
                </Link>
              </div>
              
              {/* Simple completion checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    user?.name ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {user?.name ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium">Name</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    user?.avatar ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {user?.avatar ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium">Profile Photo</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    user?.isEmailVerified || user?.isPhoneVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {user?.isEmailVerified || user?.isPhoneVerified ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium">Verification</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    user?.socialLinks?.twitter || user?.socialLinks?.instagram ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {user?.socialLinks?.twitter || user?.socialLinks?.instagram ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium">Social Links</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Header */}

        <div
           className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div 
                onClick={handlePhotoClick}
                className="cursor-pointer group"
              >
                {hasProfilePhoto(user) ? (
                  <img
                    src={getUserProfilePhoto(user)}
                    alt={user?.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-700 shadow-lg flex items-center justify-center group-hover:opacity-80 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user?.name || 'User Name'}
                </h1>
                <div className="flex gap-3">
                  
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
                <ActivityModal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} userId={user?._id} />
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                @{user?.username || 'username'}
              </p>

              {user?.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {user.bio}
                </p>
              )}

              {/* Profile Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(userStats.posts)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                </div>
                <div className="text-center cursor-pointer" onClick={() => handleShowFollowers()}>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(userStats.followers)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                </div>
                <div className="text-center cursor-pointer" onClick={() => handleShowFollowing()}>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(userStats.following)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Profile Details
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Social Links Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Links</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </label>
                        <input
                          type="text"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Your Twitter username"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </label>
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Your Instagram username"
                        />
                      </div>


                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{user?.name || 'Not set'}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{user?.email || 'Not set'}</span>
                  </div>

                  {user?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{user.location}</span>
                    </div>
                  )}

                  {user?.gender && (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{user.gender}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Joined {formatDate(user?.createdAt || new Date())}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Private Information Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Private Information
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Your personal information (email, location, gender) is only visible to you. Other users can only see your public profile.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Social Links
              </h3>
              <div className="space-y-3">
                {user?.socialLinks?.twitter && (
                  <a
                    href={`https://twitter.com/${user.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>@{user.socialLinks.twitter}</span>
                  </a>
                )}

                {user?.socialLinks?.instagram && (
                  <a
                    href={`https://instagram.com/${user.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <Instagram className="w-5 h-5" />
                    <span>@{user.socialLinks.instagram}</span>
                  </a>
                )}



                {!user?.socialLinks?.twitter && !user?.socialLinks?.instagram && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No social links added yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Posts
                </h2>
                <button 
                  onClick={handleNewPost}
                  className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </button>
              </div>

              {userBlogs.length > 0 ? (
                <div className="space-y-6">
                  {[...userBlogs].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).map((blog) => (
  <div
    key={blog._id}
    className="flex space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
    onClick={() => handleOpenBlog(blog)}
    tabIndex={0}
    role="button"
    onKeyPress={e => { if (e.key === 'Enter') handleOpenBlog(blog); }}
  >
    <img
      src={blog.coverImage}
      alt={blog.title}
      className="w-20 h-20 object-cover rounded-lg"
    />
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {blog.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
        {blog.excerpt}
      </p>
      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{formatDate(blog.publishedAt)}</span>
        <span>{blog.readTime} min read</span>
        <span>{formatNumber(blog.views)} views</span>
        <span>{formatNumber(blog.likes?.length || 0)} likes</span>
        <span>{formatNumber(blog.commentsCount || 0)} comments</span>
      </div>
    </div>
    <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
  <button
    className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
    onClick={e => { e.stopPropagation(); handleEditBlog(blog); }}
    aria-label="Edit Blog"
    title="Edit Blog"
    disabled={!!editLoadingId || !!deleteLoadingId}
  >
    {editLoadingId === blog._id ? (
      <svg className="animate-spin h-4 w-4 text-emerald-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
    ) : <Edit3 className="w-4 h-4" />}
  </button>
  <button
    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
    onClick={e => { e.stopPropagation(); handleDeleteBlog(blog); }}
    aria-label="Delete Blog"
    title="Delete Blog"
    disabled={!!deleteLoadingId || !!editLoadingId}
  >
    {deleteLoadingId === blog._id ? (
      <svg className="animate-spin h-4 w-4 text-red-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
    ) : <Trash2 className="w-4 h-4" />}
  </button>
</div>
  </div>
))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Start writing your first blog post to share your stories with the world!
                  </p>
                  <button 
                    onClick={handleCreateFirstPost}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Create Your First Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
{showDeleteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Blog Post</h3>
      <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete <span className="font-bold">{blogToDelete?.title}</span>? This action cannot be undone.</p>
      {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
      {blogToDelete && (
        <div className="text-xs text-gray-400 break-all mb-2">
          <div><b>Blog ID:</b> {blogToDelete._id}</div>
          <div><b>Slug:</b> {blogToDelete.slug}</div>
        </div>
      )}
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={closeDeleteModal}
          disabled={!!deleteLoadingId}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          onClick={confirmDeleteBlog}
          disabled={!!deleteLoadingId}
        >
          {deleteLoadingId ? (
            <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          ) : null}
          Delete
        </button>
      </div>
    </div>
  </div>
)}

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
                    disabled={isUploading}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Change Photo</span>
                  </button>

                  {hasProfilePhoto(user) && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <FollowersFollowingModal
        isOpen={showFollowersModal}
        onClose={handleCloseFollowers}
        title="Followers"
        users={followersList}
        loading={followersLoading}
      />
      {/* Following Modal */}
      <FollowersFollowingModal
        isOpen={showFollowingModal}
        onClose={handleCloseFollowing}
        title="Following"
        users={followingList}
        loading={followingLoading}
      />
    </>
  );
};

export default Profile;