import React from 'react';

import { useState, useMemo } from 'react';

const FollowersFollowingModal = ({ isOpen, onClose, title, users, loading }) => {
  const [search, setSearch] = useState("");
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const lower = search.trim().toLowerCase();
    return users.filter(u =>
      (u.name && u.name.toLowerCase().includes(lower)) ||
      (u.username && u.username.toLowerCase().includes(lower))
    );
  }, [search, users]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">No users found.</div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <img
                    src={user.avatar || user.profilePhoto || '/default-avatar.png'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                    {user.bio && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.bio}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersFollowingModal;
