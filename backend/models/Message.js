import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() { return !this.audio; }, // Only required if no audio
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  audio: {
    url: String,
    duration: Number
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(user1Id, user2Id, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id }
    ]
  })
  .populate('sender', 'name username avatar')
  .populate('receiver', 'name username avatar')
  .sort('-createdAt')
  .skip(skip)
  .limit(limit)
  .then(async messages => {
    const total = await this.countDocuments({
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id }
      ]
    });
    return {
      messages: messages.reverse(), // Show oldest first
      total
    };
  });
};

// Static method to get user conversations list
messageSchema.statics.getUserConversations = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { receiver: new mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
            '$receiver',
            '$sender'
          ]
        },
        lastMessage: { $last: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: 1,
        user: {
          _id: 1,
          name: 1,
          username: 1,
          avatar: 1
        },
        lastMessage: 1,
        unreadCount: 1
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
};

// Instance method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

export default mongoose.model('Message', messageSchema); 