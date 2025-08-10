import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegistrationTest = () => {
  const { registerStepByStep } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    username: 'testuser123',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    phone: '+1234567890',
    bio: 'Test bio',
    location: 'Test City',
    website: 'https://example.com',
    socialLinks: {
      instagram: 'testuser',
      twitter: 'testuser',
      linkedin: 'https://linkedin.com/in/testuser'
    }
  });

  const handleTestRegistration = async () => {
    setLoading(true);
    try {
      console.log('Testing registration with data:', testData);
      
      const result = await registerStepByStep(testData);
      
      console.log('Registration result:', result);
      
      if (result.success) {
        toast.success('Test registration successful!');
      } else {
        toast.error(`Test registration failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test registration error:', error);
      toast.error('Test registration failed with exception');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTestData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTestData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Registration Test
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={testData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={testData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={testData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={testData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={testData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={handleTestRegistration}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Registration'}
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Instructions:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Open browser developer tools (F12)</li>
              <li>• Go to Console tab</li>
              <li>• Click "Test Registration"</li>
              <li>• Check console logs for debugging info</li>
              <li>• Check Network tab for API requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationTest; 