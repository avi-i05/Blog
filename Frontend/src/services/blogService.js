const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all blogs
export const getBlogs = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.author) queryParams.append('author', params.author);

    const response = await fetch(`${API_BASE_URL}/blogs?${queryParams}`, {
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
      return { success: true, data: data.data, pagination: data.pagination };
    } else {
      return { success: false, error: data.message || 'Failed to fetch blogs' };
    }
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return { success: false, error: 'Failed to fetch blogs' };
  }
};

// Get featured blogs
export const getFeaturedBlogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/featured`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to fetch featured blogs' };
    }
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    return { success: false, error: 'Failed to fetch featured blogs' };
  }
};

// Get single blog by slug
export const getBlogBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
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
      return { success: false, error: data.message || 'Blog not found' };
    }
  } catch (error) {
    console.error('Error fetching blog:', error);
    return { success: false, error: 'Failed to fetch blog' };
  }
};

// Like a blog
export const likeBlog = async (blogId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/like`, {
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
      return { success: false, error: data.message || 'Failed to like blog' };
    }
  } catch (error) {
    console.error('Error liking blog:', error);
    return { success: false, error: 'Failed to like blog' };
  }
};

// Unlike a blog (same endpoint as like, it toggles)
export const unlikeBlog = async (blogId) => {
  return likeBlog(blogId); // The backend toggleLike method handles both like and unlike
};

// Bookmark a blog
export const bookmarkBlog = async (blogId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/bookmark`, {
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
      return { success: false, error: data.message || 'Failed to bookmark blog' };
    }
  } catch (error) {
    console.error('Error bookmarking blog:', error);
    return { success: false, error: 'Failed to bookmark blog' };
  }
};

// Create a new blog
export const createBlog = async (blogData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(blogData)
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
          } else {
        console.error('Blog creation API error:', data);
        
        // Handle validation errors array
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
          return { success: false, error: errorMessages };
        }
        
        return { success: false, error: data.message || 'Failed to create blog' };
      }
  } catch (error) {
    console.error('Error creating blog:', error);
    return { success: false, error: error.message || 'Failed to create blog' };
  }
};

// Update a blog
export const updateBlog = async (blogId, blogData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(blogData)
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || 'Failed to update blog' };
    }
  } catch (error) {
    console.error('Error updating blog:', error);
    return { success: false, error: 'Failed to update blog' };
  }
};

// Delete a blog
export const deleteBlog = async (blogId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
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
      return { success: false, error: data.message || 'Failed to delete blog' };
    }
  } catch (error) {
    console.error('Error deleting blog:', error);
    return { success: false, error: 'Failed to delete blog' };
  }
}; 