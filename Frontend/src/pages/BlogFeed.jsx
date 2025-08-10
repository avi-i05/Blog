import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Heart, MessageCircle, Bookmark, Clock, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getBlogs, likeBlog } from '../services/blogService';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import toast from 'react-hot-toast';

const BlogFeed = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch blogs from API
  // Debounce search to avoid refocus/remount issues
  const searchTimeout = useRef();

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchBlogs();
    }, 400); // 400ms debounce
    return () => clearTimeout(searchTimeout.current);
  }, [currentPage, selectedCategory]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),

      };

      const result = await getBlogs(params);
      
      if (result.success) {
        setBlogs(result.data);
        setPagination(result.pagination || {});
      } else {
        toast.error(result.error || 'Failed to fetch blogs');
        // Fallback to demo blog if API fails
        setBlogs([getDemoBlog()]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
      // Fallback to demo blog if API fails
      setBlogs([getDemoBlog()]);
    } finally {
      setLoading(false);
    }
  };

  // Demo blog for fallback
  const getDemoBlog = () => ({
    _id: 'demo-1',
    title: "Welcome to StoryShare - Demo Blog",
    excerpt: "This is a demo blog post to show you how your blog feed will look. Create your first blog post to see real content here!",
    coverImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
    author: {
      _id: 'demo-author',
      name: "StoryShare Team",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    category: "Technology",
    tags: ["Demo", "Welcome", "Getting Started"],
    readTime: 3,
    views: 0,
    likes: [],
    comments: [],
    publishedAt: new Date().toISOString(),
    featured: true
  });

  const categories = ['all', 'following', 'Lifestyle', 'Travel', 'Food', 'Technology', 'Health', 'Relationships', 'Business', 'Education', 'Entertainment', 'Other'];
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'oldest', label: 'Oldest' }
  ];

  const [followingUserIds, setFollowingUserIds] = useState([]);

// Fetch following user IDs if 'following' filter is selected
useEffect(() => {
  if (selectedCategory === 'following' && user) {
    import('../services/userService').then(({ getUserFollowing }) => {
      getUserFollowing(user._id, 1, 1000).then(result => {
        if (result.success) {
          setFollowingUserIds(result.data.map(u => u._id));
        } else {
          setFollowingUserIds([]);
        }
      });
    });
  } else {
    setFollowingUserIds([]);
  }
}, [selectedCategory, user]);

const filteredBlogs = blogs.filter(blog => {
  if (selectedCategory === 'following') {
    // Only show blogs authored by followed users
    return followingUserIds.includes(blog.author?._id);
  }
  const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
  return matchesCategory;
});

  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      case 'oldest':
        return new Date(a.publishedAt) - new Date(b.publishedAt);
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      case 'trending':
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      default:
        return 0;
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDay === 1) return '1 day ago';
    if (diffDay < 7) return `${diffDay} days ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleLike = async (blogId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const result = await likeBlog(blogId);
      if (result.success) {
        // Update the blog in the state with new likes array
        setBlogs(prevBlogs => 
          prevBlogs.map(blog => 
            blog._id === blogId 
              ? { ...blog, likes: result.data.likes }
              : blog
          )
        );
      } else {
        toast.error(result.error || 'Failed to like post');
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      toast.error('Failed to like post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-48 mb-4"></div>
                <div className="skeleton h-6 mb-2"></div>
                <div className="skeleton h-4 mb-4 w-3/4"></div>
                <div className="skeleton h-4 mb-2"></div>
                <div className="skeleton h-4 w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Amazing Stories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore the latest articles, tutorials, and insights from our community
          </p>
        </motion.div>

        {/* Profile Completion Card */}
        <ProfileCompletionCard />

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(category => (
  <option
    key={category}
    value={category}
    disabled={category === 'following' && !user}
  >
    {category === 'all'
      ? 'All Categories'
      : category === 'following'
        ? 'Following'
        : category}
  </option>
))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Results Count */}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredBlogs.length} articles found
            </span>
          </div>
        </motion.div>

        {/* Blog Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }`}
        >
          {sortedBlogs.map((blog, index) => (
            <motion.article
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card overflow-hidden hover:shadow-xl transition-all duration-300 ${
                viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
              }`}
            >
              {/* Cover Image */}
              <div className={`relative overflow-hidden ${
                viewMode === 'list' ? 'md:w-1/3' : ''
              }`}>
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
                  className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                {blog.featured && (
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-emerald-500 hover:text-white transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`p-6 ${
                viewMode === 'list' ? 'md:w-2/3' : ''
              }`}>
                {/* Category and Date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="tag">{blog.category}</span>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(blog.publishedAt)}
                  </div>
                </div>

                {/* Title */}
                <h2 
                  onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
                  className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {blog.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags && blog.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center mb-4">
                  <img
                    src={blog.author?.avatar || "/user.png"}
                    alt={blog.author?.name || "Unknown Author"}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {blog.author?.name || "Unknown Author"}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {blog.readTime || 5} min read
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <button 
                      onClick={() => handleLike(blog._id)}
                      className={`flex items-center hover:text-red-500 transition-colors ${
                        blog.likes && blog.likes.some(like => like === user?._id)
                          ? 'text-red-500'
                          : ''
                      }`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${
                        blog.likes && blog.likes.some(like => like === user?._id)
                          ? 'fill-current'
                          : ''
                      }`} />
                      {formatNumber(blog.likes?.length || 0)}
                    </button>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {formatNumber(blog.commentsCount ?? 0)}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {formatNumber(blog.views ?? 0)}
                    </div>
                    <button 
                      onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
                      className="btn-outline text-sm"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredBlogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search terms or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogFeed; 