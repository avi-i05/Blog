import React from 'react';

const UnfollowConfirmModal = ({ isOpen, onClose, onConfirm, username, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-xs mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Unfollow @{username}?</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">You will stop seeing their new posts in your feed.</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Unfollowing...' : 'Unfollow'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnfollowConfirmModal;
