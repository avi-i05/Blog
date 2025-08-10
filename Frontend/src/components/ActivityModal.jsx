import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users } from 'lucide-react';
import RecentActivity from './RecentActivity';
import { getRecentActivity, getFollowSuggestions } from '../services/userService';

const ActivityModal = ({ isOpen, onClose, userId }) => {
  const navigate = useNavigate();
  const [activityList, setActivityList] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setActivityLoading(true);
    setActivityError(null);
    getRecentActivity(userId)
      .then(res => {
        if (res.success) setActivityList(res.data || []);
        else setActivityError(res.error || 'Failed to load activity');
      })
      .catch(() => setActivityError('Failed to load activity'))
      .finally(() => setActivityLoading(false));
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    getFollowSuggestions(userId)
      .then(res => {
        if (res.success) setSuggestions(res.data || []);
        else setSuggestionsError(res.error || 'Failed to load suggestions');
      })
      .catch(() => setSuggestionsError('Failed to load suggestions'))
      .finally(() => setSuggestionsLoading(false));
  }, [isOpen, userId]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-lg mx-auto p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" /> Activity
          </h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh] px-6 py-4">
          <RecentActivity activityList={activityList} loading={activityLoading} error={activityError} />
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="w-5 h-5 text-emerald-500" /> Suggestions to Follow
            </h3>
            {suggestionsLoading && <div className="text-emerald-500">Loading suggestions...</div>}
            {suggestionsError && <div className="text-red-500">{suggestionsError}</div>}
            {!suggestionsLoading && suggestions.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400">No suggestions right now.</div>
            )}
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {suggestions.map(user => (
                <li key={user._id} className="flex items-center gap-4 py-3">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                    {user.bio && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.bio}</div>
                    )}
                  </div>
                  {user.username ? (
                    <button
                      onClick={() => {
                        navigate(`/user/${user.username}`);
                        if (onClose) onClose();
                      }}
                      className="px-4 py-1 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition"
                      type="button"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-red-500 text-xs">No profile</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
