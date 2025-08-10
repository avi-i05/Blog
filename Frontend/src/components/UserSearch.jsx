import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const UserSearch = () => {
  const { isDark } = useTheme();
  const { searchUsers } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (query.length < 2) {
        setUsers([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const result = await searchUsers(query);
        if (result.success) {
          setUsers(result.users);
          setShowResults(true);
        } else {
          console.error('Search failed:', result.error);
          setUsers([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchUsers]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    setUsers([]);
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search users..."
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200`}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto`}
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="py-2">
                {users.map((user) => {
                  console.log('Search suggestion username:', user.username);
                  return (
                    <Link
                      key={user._id}
                      to={`/user/${user.username}`}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      onClick={() => setShowResults(false)}
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={user.avatar || '/user.png'}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearch; 