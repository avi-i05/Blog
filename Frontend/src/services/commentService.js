const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get comments for a blog
export const getComments = async (blogId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${blogId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch comments' };
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, error: 'Failed to fetch comments' };
  }
};

// Add a comment to a blog
export const addComment = async (commentData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(commentData)
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      // Handle validation errors
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
        return { success: false, error: errorMessages };
      }
      return { success: false, error: data.message || 'Failed to add comment' };
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: 'Failed to add comment' };
  }
};

// Update a comment
export const updateComment = async (commentId, content) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
        return { success: false, error: errorMessages };
      }
      return { success: false, error: data.message || 'Failed to update comment' };
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    return { success: false, error: 'Failed to update comment' };
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to delete comment' };
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
};

// Like/unlike a comment
export const likeComment = async (commentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to like comment' };
    }
  } catch (error) {
    console.error('Error liking comment:', error);
    return { success: false, error: 'Failed to like comment' };
  }
};

// Report a comment
export const reportComment = async (commentId, reason) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
        return { success: false, error: errorMessages };
      }
      return { success: false, error: data.message || 'Failed to report comment' };
    }
  } catch (error) {
    console.error('Error reporting comment:', error);
    return { success: false, error: 'Failed to report comment' };
  }
}; 