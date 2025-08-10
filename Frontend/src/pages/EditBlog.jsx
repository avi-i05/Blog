import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBlogBySlug, updateBlog } from '../services/blogService';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { Image as ImageIcon, X as XIcon, Upload as UploadIcon } from 'lucide-react';

const EditBlog = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', coverImage: '', category: '', status: 'draft' });
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      const result = await getBlogBySlug(blogId);
      if (result.success) {
        setForm(result.data);
        setImagePreview(result.data.coverImage || null);
      } else {
        toast.error(result.error || 'Failed to load blog');
        navigate('/profile');
      }
      setLoading(false);
    };
    fetchBlog();
  }, [blogId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed.');
        return;
      }
      setUploadError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      try {
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
          setForm((prev) => ({ ...prev, coverImage: data.data.url }));
          setImagePreview(data.data.url);
        } else {
          setUploadError(data.message || 'Failed to upload image');
        }
      } catch (error) {
        setUploadError('Failed to upload image');
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm((prev) => ({ ...prev, coverImage: '' }));
  };


  const isDebug = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedForm = { ...form };
    if (!imagePreview) {
      updatedForm.coverImage = '';
    }
    if (!(form.status === 'published')) {
      delete updatedForm.publishedAt;
    }
    console.log('[DEBUG] EditBlog handleSubmit - form:', form);
    console.log('[DEBUG] EditBlog handleSubmit - request body:', updatedForm);
    const result = await updateBlog(form._id, updatedForm);
    console.log('[DEBUG] EditBlog handleSubmit - backend response:', result);
    if (result.success) {
      toast.success('Blog updated!');
      if (updatedForm.status === 'published') {
        navigate('/blogs');
      } else {
        navigate(`/blog/${result.data.slug}`);
      }
    } else {
      console.error('Update blog failed:', result.error, result);
      toast.error(result.error || 'Failed to update blog');
    }
  };


  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className={`max-w-2xl mx-auto p-8 rounded-lg shadow-lg ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h2 className="text-3xl font-extrabold mb-8 text-emerald-600 dark:text-emerald-400">Edit Blog</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {isDebug && (
          <div className="text-xs text-gray-400 mb-2">Raw publishedAt: {form.publishedAt ? String(form.publishedAt) : 'N/A'}</div>
        )}
        <div>
          <label className="block text-sm font-semibold mb-2">Cover Image</label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative group">
                <img src={imagePreview} alt="Cover Preview" className="w-40 h-28 object-cover rounded-md border shadow" />
                <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-opacity opacity-70 group-hover:opacity-100" aria-label="Remove image">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-emerald-400 rounded-md text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-gray-800 transition"
              >
                <UploadIcon className="w-5 h-5" />
                <span>Upload Image</span>
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          {uploadError && <div className="text-red-500 text-sm mt-1">{uploadError}</div>}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
          <input
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            placeholder="Excerpt"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Content"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={8}
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category (e.g. Technology, Food)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
