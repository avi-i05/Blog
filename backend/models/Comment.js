import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please add comment content'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.ObjectId,
    ref: 'Blog',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Comment'
  }],
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'other']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for likes count
commentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for replies count
commentSchema.virtual('repliesCount').get(function() {
  return this.replies.length;
});

// Static method to get comments for a blog
commentSchema.statics.getBlogComments = function(blogId) {
  return this.find({ 
    blog: blogId, 
    parentComment: null, 
    status: 'active' 
  })
  .populate('author', 'name avatar')
  .populate({
    path: 'replies',
    match: { status: 'active' },
    populate: {
      path: 'author',
      select: 'name avatar'
    }
  })
  .sort('-createdAt');
};

// Instance method to toggle like
commentSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Instance method to add reply
commentSchema.methods.addReply = function(replyId) {
  this.replies.push(replyId);
  return this.save();
};

// Instance method to report comment
commentSchema.methods.report = function(userId, reason) {
  const existingReport = this.reportedBy.find(
    report => report.user.toString() === userId.toString()
  );
  
  if (existingReport) {
    existingReport.reason = reason;
    existingReport.reportedAt = new Date();
  } else {
    this.reportedBy.push({
      user: userId,
      reason: reason
    });
  }
  
  return this.save();
};

export default mongoose.model('Comment', commentSchema); 