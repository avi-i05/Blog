import React from 'react';
import { MessageCircle, Heart, Edit3, UserPlus, User } from 'lucide-react';

// activity: { type, date, target, meta }
// type: 'blog_published', 'blog_commented', 'blog_liked', 'user_followed', ...
// meta: { blogTitle, blogId, comment, username, ... }

const activityIcons = {
  blog_published: <Edit3 className="w-5 h-5 text-emerald-600" />,
  blog_commented: <MessageCircle className="w-5 h-5 text-blue-600" />,
  blog_liked: <Heart className="w-5 h-5 text-pink-500" />,
  user_followed: <UserPlus className="w-5 h-5 text-indigo-500" />,
};

function formatActivity(activity) {
  switch (activity.type) {
    case 'blog_published':
      return <span>Published a new blog: <b>{activity.meta.blogTitle}</b></span>;
    case 'blog_commented':
      return <span>Commented on <b>{activity.meta.blogTitle}</b>: "{activity.meta.comment}"</span>;
    case 'blog_liked':
      return <span>Liked <b>{activity.meta.blogTitle}</b></span>;
    case 'user_followed':
      return <span>Followed <b>@{activity.meta.username}</b></span>;
    default:
      return <span>Did something</span>;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
  return date.toLocaleDateString();
}

const RecentActivity = ({ activityList, loading, error }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <span>Recent Activity</span>
        {loading && <span className="ml-2 text-xs text-emerald-500 animate-pulse">Loading...</span>}
      </h3>
      {error && <div className="text-red-500 dark:text-red-400 mb-2">{error}</div>}
      {!loading && (!activityList || activityList.length === 0) && (
        <div className="text-gray-500 dark:text-gray-400">No recent activity yet.</div>
      )}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {activityList && activityList.map((activity, i) => {
          let avatar = null;
          let label = null;
          // Avatar or blog cover for each type
          if (activity.type === 'blog_liked') {
            avatar = activity.meta?.author?.avatar ? (
              <img src={activity.meta.author.avatar} alt="author avatar" className="w-10 h-10 rounded-full object-cover border-2 border-pink-400 shadow" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center border-2 border-pink-400">
                <User className="w-6 h-6 text-pink-500" />
              </div>
            );
            label = <span>Liked <b className="text-emerald-600">{activity.meta.blogTitle}</b> by <b className="text-indigo-500">@{activity.meta.author?.username}</b></span>;
          } else if (activity.type === 'user_followed') {
            avatar = activity.meta?.avatar ? (
              <img src={activity.meta.avatar} alt="user avatar" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 shadow" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-400">
                <UserPlus className="w-6 h-6 text-indigo-500" />
              </div>
            );
            label = <span>Followed <b className="text-indigo-600">@{activity.meta.username}</b></span>;
          } else if (activity.type === 'user_follower') {
            avatar = activity.meta?.avatar ? (
              <img src={activity.meta.avatar} alt="user avatar" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-400">
                <User className="w-6 h-6 text-emerald-500" />
              </div>
            );
            label = <span><b className="text-emerald-600">@{activity.meta.username}</b> followed you</span>;
          }
          return (
            <li key={i} className="flex items-center space-x-4 py-3 group hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div>{avatar}</div>
              <div className="flex-1 text-gray-700 dark:text-gray-200 text-sm">
                {label}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 min-w-max">{formatDate(activity.date)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentActivity;
