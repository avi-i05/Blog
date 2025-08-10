import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Star, 
  Zap,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';

const LandingPage = () => {
  const featuredBlogs = [
    {
      id: 1,
      title: "The Art of Mindful Living",
      excerpt: "Discover how to find peace and purpose in our fast-paced world through simple daily practices.",
      author: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      category: "Lifestyle",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "A Journey Through Southeast Asia",
      excerpt: "Exploring the hidden gems and cultural treasures of Vietnam, Thailand, and Cambodia.",
      author: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      category: "Travel",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Culinary Adventures in Paris",
      excerpt: "From street food to Michelin-starred restaurants, a food lover's guide to the City of Light.",
      author: "Emma Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      category: "Food",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1504674900240-8947e31b94ab?w=400&h=250&fit=crop"
    }
  ];

  const categories = [
    { name: "Lifestyle", count: 156, color: "emerald" },
    { name: "Travel", count: 89, color: "blue" },
    { name: "Food", count: 234, color: "orange" },
    { name: "Technology", count: 67, color: "purple" },
    { name: "Health", count: 123, color: "green" },
    { name: "Relationships", count: 78, color: "pink" }
  ];

  const stats = [
    { label: "Active Writers", value: "10K+", icon: Users },
    { label: "Stories Published", value: "50K+", icon: BookOpen },
    { label: "Happy Readers", value: "100K+", icon: Heart },
    { label: "Countries", value: "150+", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-emerald-200/30 dark:bg-emerald-800/30 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-20 w-24 h-24 bg-teal-200/30 dark:bg-teal-800/30 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/3 w-16 h-16 bg-cyan-200/30 dark:bg-cyan-800/30 rounded-full blur-xl"
          />
        </div>

        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-50" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Floating Icons */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-32 right-32 text-emerald-400/30 dark:text-emerald-600/30"
        >
          <Sparkles className="h-8 w-8" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-32 left-32 text-teal-400/30 dark:text-teal-600/30"
        >
          <Star className="h-6 w-6" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 text-cyan-400/30 dark:text-cyan-600/30"
        >
          <Zap className="h-5 w-5" />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Share Your
              <span className="text-gradient block"> Stories</span>
            </motion.h1>

            {/* Animated Underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto mb-8"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Connect with readers worldwide. Share your experiences, insights, and creativity through beautiful storytelling.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link to="/step-signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                >
                  <span>Start Writing</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link to="/blogs">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
                >
                  <span>Explore Stories</span>
                  <BookOpen className="h-5 w-5" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.img
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=32&h=32&fit=crop&crop=face`}
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                    />
                  ))}
                </div>
                <span>Join 10,000+ writers</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span>4.9/5 rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <stat.icon className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div
                  whileInView={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover amazing content from our community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="card overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute top-4 left-4">
                    <span className="tag">{blog.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={blog.avatar}
                        alt={blog.author}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {blog.author}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/blogs"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>View All Stories</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find stories that match your interests
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                  category.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900' :
                  category.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                  category.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900' :
                  category.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                  category.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  category.color === 'pink' ? 'bg-pink-100 dark:bg-pink-900' :
                  'bg-gray-100 dark:bg-gray-900'
                }`}>
                  <BookOpen className={`h-6 w-6 ${
                    category.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    category.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    category.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    category.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    category.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    category.color === 'pink' ? 'text-pink-600 dark:text-pink-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.count} stories
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 