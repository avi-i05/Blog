const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch user profile' };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
};

// Get user profile by username (public)
export const getUserProfileByUsername = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch user profile' };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
};

// Get follow suggestions
export const getFollowSuggestions = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/suggestions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch suggestions' };
    }
  } catch (error) {
    console.error('Error fetching follow suggestions:', error);
    return { success: false, error: 'Failed to fetch suggestions' };
  }
};

// Get recent activity (likes, follows, followers)
export const getRecentActivity = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/activity/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch activity' };
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return { success: false, error: 'Failed to fetch activity' };
  }
};

// Get user stats
export const getUserStats = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch user stats' };
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { success: false, error: 'Failed to fetch user stats' };
  }
};

// Get user's blogs
export const getUserBlogs = async (userId, params = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/blogs/user/${userId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data, pagination: data.pagination };
    } else {
      return { success: false, error: data.message || 'Failed to fetch user blogs' };
    }
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return { success: false, error: 'Failed to fetch user blogs' };
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to update profile' };
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
};

// Upload user avatar
export const uploadUserAvatar = async (userId, file) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to upload avatar' };
    }
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { success: false, error: 'Failed to upload avatar' };
  }
};

// Get user followers
export const getUserFollowers = async (userId, page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/followers?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data, pagination: data.pagination, total: data.total };
    } else {
      return { success: false, error: data.message || 'Failed to fetch followers' };
    }
  } catch (error) {
    console.error('Error fetching followers:', error);
    return { success: false, error: 'Failed to fetch followers' };
  }
};

// Get user following
export const getUserFollowing = async (userId, page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/following?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data, pagination: data.pagination, total: data.total };
    } else {
      return { success: false, error: data.message || 'Failed to fetch following' };
    }
  } catch (error) {
    console.error('Error fetching following:', error);
    return { success: false, error: 'Failed to fetch following' };
  }
};

// Follow a user
export const followUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/follow/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message || 'Failed to follow user' };
    }
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: 'Failed to follow user' };
  }
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/follow/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message || 'Failed to unfollow user' };
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: 'Failed to unfollow user' };
  }
};

// Check if current user is following another user
export const checkIsFollowing = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/is-following`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data.isFollowing };
    } else {
      return { success: false, error: data.message || 'Failed to check following status' };
    }
  } catch (error) {
    console.error('Error checking following status:', error);
    return { success: false, error: 'Failed to check following status' };
  }
}; 