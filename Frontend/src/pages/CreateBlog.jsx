import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Save, Eye, Upload, X, Plus, Tag, Calendar, User, Image as ImageIcon, Type, Bold, Italic, Hash, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { createBlog } from '../services/blogService.js';

const CreateBlog = () => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    coverImage: null,
    status: 'draft'
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);


  const categories = [
    'Lifestyle',
    'Travel',
    'Food',
    'Technology',
    'Health',
    'Relationships',
    'Business',
    'Education',
    'Entertainment',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Create preview first
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            coverImage: data.data.url
          }));
          toast.success('Image uploaded successfully!');
        } else {
          toast.error(data.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      coverImage: null
    }));
    setImagePreview(null);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Please enter a title');
        setLoading(false);
        return;
      }
      if (!formData.excerpt.trim()) {
        toast.error('Please enter an excerpt');
        setLoading(false);
        return;
      }
      if (!formData.content.trim()) {
        toast.error('Please enter content');
        setLoading(false);
        return;
      }
      if (!formData.category) {
        toast.error('Please select a category');
        setLoading(false);
        return;
      }

      // Prepare blog data
      const blogData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        coverImage: formData.coverImage || undefined,
        status: 'published'
      };

      console.log('Publishing blog data:', blogData);
      const result = await createBlog(blogData);

      if (result.success) {
        toast.success('Blog published successfully!');
        navigate('/blogs');
      } else {
        console.error('Blog creation failed:', result.error);
        toast.error(result.error || 'Failed to publish blog');
      }
    } catch (error) {
      console.error('Error publishing blog:', error);
      toast.error(`Failed to publish blog: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);

    try {
      // Prepare blog data for draft
      const blogData = {
        title: formData.title.trim() || 'Untitled Draft',
        excerpt: formData.excerpt.trim() || 'No excerpt provided',
        content: formData.content.trim() || 'No content provided',
        category: formData.category || 'Other',
        tags: formData.tags,
        coverImage: formData.coverImage || undefined,
        status: 'draft'
      };

      console.log('Saving draft:', blogData);
      const result = await createBlog(blogData);

      if (result.success) {
        toast.success('Draft saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const formatContent = (content) => {
    // Simple markdown-like formatting for preview with larger headings and better spacing
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-900 dark:text-white">$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-6">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-5 mt-8">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6 mt-10">$1</h1>')
      .replace(/\n/g, '<br>');
  };

  // Check if formatting is active at cursor position
  const getActiveFormat = () => {
    const textarea = document.querySelector('textarea[name="content"]') || document.querySelector('textarea[placeholder*="Write your blog content"]');
    if (!textarea) return null;

    const cursorPos = textarea.selectionStart;
    const value = textarea.value;
    
    // Check if cursor is at the start of a line with heading
    const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
    const lineContent = value.substring(lineStart, cursorPos);
    
    if (lineContent.startsWith('# ')) return 'heading1';
    if (lineContent.startsWith('## ')) return 'heading2';
    if (lineContent.startsWith('### ')) return 'heading3';
    if (lineContent.startsWith('- ')) return 'list';
    
    // Check if cursor is inside bold or italic formatting
    
    // Check for bold formatting - look for **text** pattern
    const boldPattern = /\*\*([^*]*)\*\*/g;
    let boldMatch;
    while ((boldMatch = boldPattern.exec(value)) !== null) {
      const start = boldMatch.index;
      const end = start + boldMatch[0].length;
      if (cursorPos > start && cursorPos < end) {
        return 'bold';
      }
    }
    
    // Check for italic formatting - look for *text* pattern
    const italicPattern = /\*([^*]*)\*/g;
    let italicMatch;
    while ((italicMatch = italicPattern.exec(value)) !== null) {
      const start = italicMatch.index;
      const end = start + italicMatch[0].length;
      if (cursorPos > start && cursorPos < end) {
        return 'italic';
      }
    }
    
    return null;
  };

  // Simple formatting - just insert at cursor or wrap selected text
  const insertFormat = (formatType) => {
    const textarea = document.querySelector('textarea[name="content"]') || document.querySelector('textarea[placeholder*="Write your blog content"]');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selectedText = value.substring(start, end);

    let insertText = '';
    let newCursorPos = start;

    switch (formatType) {
      case 'heading1':
        insertText = selectedText ? `# ${selectedText}` : '# ';
        newCursorPos = start + insertText.length;
        break;
      case 'heading2':
        insertText = selectedText ? `## ${selectedText}` : '## ';
        newCursorPos = start + insertText.length;
        break;
      case 'heading3':
        insertText = selectedText ? `### ${selectedText}` : '### ';
        newCursorPos = start + insertText.length;
        break;
      case 'bold':
        insertText = selectedText ? `**${selectedText}**` : '**';
        newCursorPos = start + insertText.length;
        break;
      case 'italic':
        insertText = selectedText ? `*${selectedText}*` : '*';
        newCursorPos = start + insertText.length;
        break;
      case 'list':
        insertText = selectedText ? `- ${selectedText}` : '- ';
        newCursorPos = start + insertText.length;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + insertText + value.substring(end);
    textarea.value = newValue;
    
    setFormData(prev => ({
      ...prev,
      content: newValue
    }));
    
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
  };

  const handleContentChange = (e) => {
    setFormData(prev => ({
      ...prev,
      content: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create New Blog Post
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Share your thoughts and ideas with the world
              </p>
            </div>
                         <div className="flex items-center space-x-3">
               <button
                 onClick={() => setPreviewMode(!previewMode)}
                 className="btn-secondary"
               >
                 <Eye className="w-4 h-4 mr-2" />
                 {previewMode ? 'Edit' : 'Preview'}
               </button>
               <button
                 onClick={handleSaveDraft}
                 disabled={loading}
                 className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
               >
                 <Save className="w-4 h-4 mr-2" />
                 {loading ? 'Saving...' : 'Save Draft'}
               </button>
               <button
                 onClick={handleSubmit}
                 disabled={loading}
                 className="btn-primary"
               >
                 <Save className="w-4 h-4 mr-2" />
                 {loading ? 'Publishing...' : 'Publish'}
               </button>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your blog title..."
                  className="input-field text-2xl font-bold"
                />
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief description of your blog post..."
                  rows="3"
                  className="input-field"
                />
              </div>

                             {/* Cover Image */}
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Cover Image
                 </label>
                 {imagePreview ? (
                   <div className="relative group">
                     <img
                       src={formData.coverImage || imagePreview}
                       alt="Cover preview"
                       className="w-full h-64 object-cover rounded-lg shadow-lg"
                     />
                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                       <button
                         onClick={removeImage}
                         className="opacity-0 group-hover:opacity-100 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 transform scale-90 group-hover:scale-100"
                         title="Remove image"
                       >
                         <X className="w-5 h-5" />
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-emerald-400 dark:hover:border-emerald-400 transition-colors duration-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                     <div className="flex flex-col items-center">
                       <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
                         <ImageIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                       </div>
                       <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                         Upload Cover Image
                       </h3>
                       <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                         Choose a high-quality image to make your blog post stand out. Recommended size: 1200x630px
                       </p>
                       <label className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-300 cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl">
                         <Upload className="w-5 h-5 mr-2" />
                         Choose Image
                         <input
                           type="file"
                           accept="image/*"
                           onChange={handleImageUpload}
                           className="hidden"
                         />
                       </label>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                         PNG, JPG, GIF up to 5MB
                       </p>
                     </div>
                   </div>
                 )}
               </div>

              {/* Content Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                
                                                  {/* Formatting Toolbar */}
                 <div className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                   <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">Quick Format:</span>
                   
                                       <button
                      type="button"
                      onClick={() => insertFormat('heading1')}
                      className={`flex items-center px-2 py-1 text-xs border rounded transition-colors ${
                        getActiveFormat() === 'heading1' 
                          ? 'bg-yellow-400 text-gray-900 border-yellow-500 shadow-md' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      title="H1 - Select text or click to insert"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      H1
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertFormat('heading2')}
                      className={`flex items-center px-2 py-1 text-xs border rounded transition-colors ${
                        getActiveFormat() === 'heading2' 
                          ? 'bg-yellow-400 text-gray-900 border-yellow-500 shadow-md' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      title="H2 - Select text or click to insert"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      H2
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertFormat('heading3')}
                      className={`flex items-center px-2 py-1 text-xs border rounded transition-colors ${
                        getActiveFormat() === 'heading3' 
                          ? 'bg-yellow-400 text-gray-900 border-yellow-500 shadow-md' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      title="H3 - Select text or click to insert"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      H3
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertFormat('bold')}
                      className={`flex items-center px-2 py-1 text-xs border rounded transition-colors ${
                        getActiveFormat() === 'bold' 
                          ? 'bg-yellow-400 text-gray-900 border-yellow-500 shadow-md' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      title="Bold - Select text or click to insert"
                    >
                      <Bold className="w-3 h-3 mr-1" />
                      Bold
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertFormat('italic')}
                      className={`flex items-center px-2 py-1 text-xs border rounded transition-colors ${
                        getActiveFormat() === 'italic' 
                          ? 'bg-yellow-400 text-gray-900 border-yellow-500 shadow-md' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      title="Italic - Select text or click to insert"
                    >
                      <Italic className="w-3 h-3 mr-1" />
                      Italic
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertFormat('list')}
                      className={`flex items-center px-2 py-1 text-xs border rounded transition-colors ${
                        getActiveFormat() === 'list' 
                          ? 'bg-yellow-400 text-gray-900 border-yellow-500 shadow-md' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      title="List - Select text or click to insert"
                    >
                      <List className="w-3 h-3 mr-1" />
                      List
                    </button>
                 </div>
                {previewMode ? (
                  <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800 min-h-96">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(formData.content) }} />
                  </div>
                ) : (
                  <div className="relative">
                                                                                                        <textarea
                       value={formData.content}
                       onChange={handleContentChange}
                       placeholder="Write your blog content here... You can use markdown-like formatting:
    **bold text**
    *italic text*
    # Heading 1
    ## Heading 2
    ### Heading 3"
                       rows="20"
                       className="input-field font-mono text-sm"
                     />
                    <div className="absolute bottom-4 right-4 text-xs text-gray-500 dark:text-gray-400">
                      {formData.content.length} characters
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
                             {/* Publish Settings */}
               <div className="card p-6">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                   Publish Settings
                 </h3>
                 
                 {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm px-2 py-1 rounded-full"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1 input-field text-sm"
                    />
                    <button
                      onClick={addTag}
                      className="ml-2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Author Info */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Author Info
                </h3>
                <div className="flex items-center">
                  <img
                    src={user?.avatar || "/user.png"}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Word Count & Stats */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Words</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formData.content.split(/\s+/).filter(word => word.length > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Characters</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formData.content.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Reading Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ~{Math.ceil(formData.content.split(/\s+/).filter(word => word.length > 0).length / 200)} min
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog; 