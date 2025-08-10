import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            StoryShare
          </h1>
        </motion.div>

        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-16 h-16 mx-auto mb-6"
        >
          <div className="absolute inset-0 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-emerald-600 dark:border-t-emerald-400 rounded-full"></div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400"
        >
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Loading your stories...</span>
            <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
          </div>
        </motion.div>

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center space-x-1 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-emerald-500 rounded-full"
            />
          ))}
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-8 h-8 bg-emerald-200/30 dark:bg-emerald-800/30 rounded-full blur-sm"
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 right-20 w-6 h-6 bg-teal-200/30 dark:bg-teal-800/30 rounded-full blur-sm"
      />

      <motion.div
        animate={{
          x: [0, 25, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-10 w-4 h-4 bg-cyan-200/30 dark:bg-cyan-800/30 rounded-full blur-sm"
      />
    </div>
  );
};

export default LoadingSpinner; 