import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Clock, User, Calendar, Tag, ThumbsUp, Reply, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getBlogBySlug, likeBlog, bookmarkBlog } from '../services/blogService';
import { getComments, addComment, likeComment, deleteComment } from '../services/commentService';
import toast from 'react-hot-toast';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showReplyTo, setShowReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch blog data
  useEffect(() => {
    fetchBlog();
  }, [slug, user?._id]);

  // Fetch comments
  useEffect(() => {
    if (blog?._id) {
      fetchComments();
    }
  }, [blog?._id]);

  // Update like/bookmark state when user changes
  useEffect(() => {
    if (blog && user && user._id) {
      setLiked(blog.likes?.includes(user._id) || false);
      setBookmarked(blog.bookmarks?.includes(user._id) || false);
    } else if (blog && !user) {
      setLiked(false);
      setBookmarked(false);
    }
  }, [user, blog]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const result = await getBlogBySlug(slug);
      if (result.success) {
        setBlog(result.data);
        // Check if user has liked/bookmarked this blog
        if (user && user._id) {
          setLiked(result.data.likes?.includes(user._id) || false);
          setBookmarked(result.data.bookmarks?.includes(user._id) || false);
        } else {
          // Reset like/bookmark state if no user
          setLiked(false);
          setBookmarked(false);
        }
      } else {
        toast.error(result.error || 'Blog not found');
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const result = await getComments(blog._id);
      if (result.success) {
        setComments(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to fetch comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleLike = async () => {
  if (!user) {
    toast.error('Please login to like posts');
    return;
  }

  try {
    const result = await likeBlog(blog._id);
    if (result.success) {
      const updatedLikes = result.data.likes;
      setBlog(prev => ({
        ...prev,
        likes: updatedLikes
      }));
      setLiked(updatedLikes.includes(user._id));
      toast.success(updatedLikes.includes(user._id) ? 'Post liked!' : 'Post unliked');
    } else {
      toast.error(result.error || 'Failed to like post');
    }
  } catch (error) {
    console.error('Error liking blog:', error);
    toast.error('Failed to like post');
  }
};

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please login to bookmark posts');
      return;
    }

    try {
      const result = await bookmarkBlog(blog._id);
      if (result.success) {
        const newBookmarkedState = !bookmarked;
        setBookmarked(newBookmarkedState);
        setBlog(prev => ({
          ...prev,
          bookmarks: result.data.bookmarks
        }));
        toast.success(newBookmarkedState ? 'Post bookmarked!' : 'Post removed from bookmarks');
      } else {
        toast.error(result.error || 'Failed to bookmark post');
      }
    } catch (error) {
      console.error('Error bookmarking blog:', error);
      toast.error('Failed to bookmark post');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const result = await addComment({
        content: newComment,
        blogId: blog._id
      });

      if (result.success) {
        setComments([result.data, ...comments]);
        setNewComment('');
        toast.success('Comment added successfully!');
      } else {
        toast.error(result.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const result = await addComment({
        content: replyContent,
        blogId: blog._id,
        parentCommentId: parentCommentId
      });

      if (result.success) {
        // Update the parent comment with the new reply
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === parentCommentId 
              ? { ...comment, replies: [...(comment.replies || []), result.data] }
              : comment
          )
        );
        setReplyContent('');
        setShowReplyTo(null);
        toast.success('Reply added successfully!');
      } else {
        toast.error(result.error || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      const result = await likeComment(commentId);
      if (result.success) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId 
              ? { ...comment, likes: result.data.likes }
              : comment
          )
        );
        // Also update replies if they exist
        setComments(prevComments => 
          prevComments.map(comment => ({
            ...comment,
            replies: comment.replies?.map(reply => 
              reply._id === commentId 
                ? { ...reply, likes: result.data.likes }
                : reply
            ) || []
          }))
        );
      } else {
        toast.error(result.error || 'Failed to like comment');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        setComments(prevComments => 
          prevComments.filter(comment => comment._id !== commentId)
        );
        toast.success('Comment deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8">
            <div className="skeleton h-8 mb-4"></div>
            <div className="skeleton h-4 mb-2"></div>
            <div className="skeleton h-4 mb-6 w-3/4"></div>
            <div className="skeleton h-96 mb-6"></div>
            <div className="space-y-4">
              <div className="skeleton h-4"></div>
              <div className="skeleton h-4"></div>
              <div className="skeleton h-4 w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Blog not found
            </h1>
            <button 
              onClick={() => navigate('/blogs')}
              className="btn-primary"
            >
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/blogs')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </motion.button>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden mb-8"
        >
          {/* Cover Image */}
          <div className="relative h-64 md:h-80">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            {blog.featured && (
              <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Featured
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-8">
            {/* Meta Information */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(blog.publishedAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {blog.readTime} min read
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {formatNumber(blog.views || 0)} views
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    liked
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{formatNumber(blog.likes?.length || 0)}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    bookmarked
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                  <span>{formatNumber(blog.bookmarks?.length || 0)}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {blog.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags && blog.tags.map(tag => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
              <div className="flex items-center">
                <img
                  src={blog.author?.avatar || "/user.png"}
                  alt={blog.author?.name || "Unknown Author"}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {blog.author?.name || "Unknown Author"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {blog.author?.bio || "Blog author"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (blog.author?.username) {
                    navigate(`/user/${blog.author.username}`);
                  } else {
                    alert("Profile unavailable");
                  }
                }}
                className="btn-outline text-sm"
              >
                View Profile
              </button>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </motion.article>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Add Comment */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex items-start space-x-3">
                <img
                  src={user.avatar || "/user.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    disabled={submitting}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments Loading */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="skeleton w-10 h-10 rounded-full"></div>
                  <div className="flex-1">
                    <div className="skeleton h-4 mb-2 w-1/4"></div>
                    <div className="skeleton h-4 mb-1"></div>
                    <div className="skeleton h-4 w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Comments List */
            <div className="space-y-6">
              {comments.map((comment) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.author?.avatar || "/user.png"}
                      alt={comment.author?.name || "Anonymous"}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {comment.author?.name || "Anonymous"}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                          {user && (comment.author?._id === user._id || user.role === 'admin') && (
                            <button 
                              onClick={() => handleCommentDelete(comment._id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleCommentLike(comment._id)}
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            comment.likes?.includes(user?._id)
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{comment.likes?.length || 0}</span>
                        </button>
                        <button
                          onClick={() => setShowReplyTo(showReplyTo === comment._id ? null : comment._id)}
                          className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Reply className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                      
                      {/* Reply Form */}
                      {showReplyTo === comment._id && (
                        <form className="mt-4" onSubmit={(e) => { e.preventDefault(); handleReplySubmit(comment._id); }}>
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none text-sm"
                            disabled={submitting}
                          />
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowReplyTo(null)}
                              className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                              disabled={submitting}
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              disabled={!replyContent.trim() || submitting}
                              className="btn-primary text-sm disabled:opacity-50"
                            >
                              {submitting ? 'Posting...' : 'Reply'}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 ml-8 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                              <div className="flex items-start space-x-3">
                                <img
                                  src={reply.author?.avatar || "/user.png"}
                                  alt={reply.author?.name || "Anonymous"}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                      {reply.author?.name || "Anonymous"}
                                    </h5>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    {reply.content}
                                  </p>
                                  <button
                                    onClick={() => handleCommentLike(reply._id)}
                                    className={`flex items-center space-x-1 text-xs transition-colors ${
                                      reply.likes?.includes(user?._id)
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>{reply.likes?.length || 0}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Comments */}
          {!commentsLoading && comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No comments yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetail; 