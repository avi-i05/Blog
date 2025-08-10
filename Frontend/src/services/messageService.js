const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Send a message
export const sendMessage = async (receiverId, content, isAudio = false) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    let body;
    let endpoint = '/messages';
    
    if (isAudio && content instanceof FormData) {
      // For audio files, we send as FormData
      endpoint = '/messages/audio';
      body = content;
      // Don't set Content-Type header - let the browser set it with the correct boundary
    } else {
      // For regular text messages
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ receiverId, content });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to send message' };
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
};

// Get user conversations list
export const getConversations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
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
      return { success: false, error: data.message || 'Failed to fetch conversations' };
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: 'Failed to fetch conversations' };
  }
};

// Get conversation between two users
export const getConversation = async (userId, page = 1, limit = 50) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/conversation/${userId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { 
        success: true, 
        data: data.data, 
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } else {
      return { success: false, error: data.message || 'Failed to fetch conversation' };
    }
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { success: false, error: 'Failed to fetch conversation' };
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to mark message as read' };
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    return { success: false, error: 'Failed to mark message as read' };
  }
};

// Get unread messages count
export const getUnreadCount = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data.count };
    } else {
      return { success: false, error: data.message || 'Failed to fetch unread count' };
    }
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { success: false, error: 'Failed to fetch unread count' };
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
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
      return { success: false, error: data.message || 'Failed to delete message' };
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'Failed to delete message' };
  }
}; 