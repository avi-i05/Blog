import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserProfileByUsername, getUserStats, getUserBlogs, followUser, unfollowUser, checkIsFollowing } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import UnfollowConfirmModal from '../components/UnfollowConfirmModal';

const PublicProfile = () => {
  const { username } = useParams();
console.log('Profile username param:', username);
  const { user: currentUser } = useAuth();
  const { isDark } = useTheme();
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profileResult = await getUserProfileByUsername(username);
        if (profileResult.success) {
          setUserData(profileResult.data);
          
          // Fetch user stats
          const statsResult = await getUserStats(profileResult.data._id);
          if (statsResult.success) {
            setUserStats(statsResult.data);
          }
          
          // Fetch user blogs
          const blogsResult = await getUserBlogs(profileResult.data._id);
          if (blogsResult.success) {
            setUserBlogs(blogsResult.data);
          }
          
          // Check if current user is following this user
          if (currentUser && currentUser._id !== profileResult.data._id) {
            const followingResult = await checkIsFollowing(profileResult.data._id);
            if (followingResult.success) {
              setIsFollowing(followingResult.data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return;
    if (isFollowing) {
      setShowUnfollowModal(true);
      return;
    }
    try {
      setFollowLoading(true);
      const result = await followUser(userData._id);
      if (result.success) {
        setIsFollowing(true);
        if (userStats) {
          setUserStats(prev => ({
            ...prev,
            followersCount: prev.followersCount + 1
          }));
        }
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
            User not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end space-x-6">
                <div className="relative">
                  <img
                    src={userData.avatar || "/user.png"}
                    alt={userData.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {userData.name}
                  </h1>
                  <p className="text-blue-100 mb-4">
                    @{userData.username}
                  </p>
                  {currentUser && currentUser._id !== userData._id && (
                    <>
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={handleFollow}
                          disabled={followLoading}
                          className={`px-6 py-2 rounded-full font-medium transition-colors ${
                            isFollowing
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button
                          onClick={() => window.location.href = `/messages?to=${userData._id}`}
                          className="px-6 py-2 rounded-full font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        >
                          Message
                        </button>
                      </div>
                      <UnfollowConfirmModal
                        isOpen={showUnfollowModal}
                        onClose={() => setShowUnfollowModal(false)}
                        onConfirm={async () => {
  setFollowLoading(true);
  try {
    const result = await unfollowUser(userData?._id);
    if (result && result.success) {
      setIsFollowing(false);
      setUserStats(prev => prev ? ({
        ...prev,
        followersCount: prev.followersCount > 0 ? prev.followersCount - 1 : 0
      }) : prev);
    } else if (result && result.error) {
      window.toast && window.toast.error(result.error);
      // fallback: alert(result.error);
    }
  } catch (error) {
    console.error('Error during unfollow:', error);
    window.toast && window.toast.error('Something went wrong. Please try again.');
  } finally {
    setFollowLoading(false);
    setShowUnfollowModal(false);
  }
}}
username={userData?.username || ''}
loading={followLoading}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            {userData.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {userData.bio}
              </p>
            )}

            {/* Stats */}
            {userStats && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(userStats.blogsCount || 0)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(userStats.followersCount || 0)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Followers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(userStats.followingCount || 0)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Following
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(userStats.totalViews || 0)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Views
                  </div>
                </div>
              </div>
            )}

            {/* Join Date */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Joined {new Date(userData.createdAt).toLocaleDateString()}
            </div>

            {/* Social Links */}
            {userData.socialLinks && Object.values(userData.socialLinks).some(link => link) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Social Links
                </h3>
                <div className="flex space-x-4">
                  {userData.socialLinks.twitter && (
                    <a
                      href={userData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Twitter
                    </a>
                  )}
                  {userData.socialLinks.instagram && (
                    <a
                      href={userData.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:text-pink-600"
                    >
                      Instagram
                    </a>
                  )}
                  {userData.socialLinks.linkedin && (
                    <a
                      href={userData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-800"
                    >
                      LinkedIn
                    </a>
                  )}
                  {userData.socialLinks.github && (
                    <a
                      href={userData.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Posts
              </h3>
              {userBlogs.length > 0 ? (
                <div className="space-y-4">
                  {userBlogs.slice(0, 5).map((blog) => (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <Link to={`/blog/${blog.slug}`}>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                          {blog.title}
                        </h4>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{blog.category}</span>
                        <div className="flex items-center space-x-4">
                          <span>{blog.views} views</span>
                          <span>{blog.likes?.length || 0} likes</span>
                          <span>{blog.commentsCount || 0} comments</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No posts yet.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Error Boundary wrapper for this page
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen flex items-center justify-center text-red-600">Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

export default (props) => (
  <ErrorBoundary>
    <PublicProfile {...props} />
  </ErrorBoundary>
);