import { BookOpen } from 'lucide-react';

const ActivityButton = ({ onClick, hasNotification }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400`}
    aria-label="View Activity"
    type="button"
  >
    <BookOpen className="h-5 w-5" />
    {hasNotification && (
      <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
    )}
  </button>
);

export default ActivityButton;
