import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  excerpt: {
    type: String,
    required: [true, 'Please add an excerpt'],
    maxlength: [200, 'Excerpt cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Lifestyle', 'Travel', 'Food', 'Technology', 'Health', 'Relationships', 'Business', 'Education', 'Entertainment', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create unique index on slug with sparse option to allow null values
blogSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Create blog slug from the title
blogSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    next();
    return;
  }
  
  try {
    let baseSlug = slugify(this.title, { lower: true });
    // Add timestamp to make slug unique
    this.slug = `${baseSlug}-${Date.now()}`;
    
    // Calculate read time (rough estimate: 200 words per minute)
    if (this.content) {
      const wordCount = this.content.split(' ').length;
      this.readTime = Math.ceil(wordCount / 200);
    } else {
      this.readTime = 0;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for comments count
blogSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true
});

// Virtual for likes count
blogSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for bookmarks count
blogSchema.virtual('bookmarksCount').get(function() {
  return this.bookmarks.length;
});

// Static method to get featured blogs
blogSchema.statics.getFeatured = function() {
  return this.find({ featured: true, status: 'published' })
    .populate('author', 'name avatar')
    .sort('-publishedAt')
    .limit(6);
};

// Static method to get blogs by category
blogSchema.statics.getByCategory = function(category) {
  return this.find({ category, status: 'published' })
    .populate('author', 'name avatar')
    .sort('-publishedAt');
};

// Static method to search blogs
blogSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { status: 'published' },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { excerpt: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  })
  .populate('author', 'name avatar')
  .sort('-publishedAt');
};

// Instance method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to toggle like
blogSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Instance method to toggle bookmark
blogSchema.methods.toggleBookmark = function(userId) {
  const index = this.bookmarks.indexOf(userId);
  if (index > -1) {
    this.bookmarks.splice(index, 1);
  } else {
    this.bookmarks.push(userId);
  }
  return this.save();
};

export default mongoose.model('Blog', blogSchema); 