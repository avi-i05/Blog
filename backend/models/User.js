import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters'],
    match: [
      /^[a-zA-Z0-9._]+$/,
      'Username can only contain letters, numbers, dots, and underscores'
    ]
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    match: [
      /^\+?[\d\s-()]+$/,
      'Please add a valid phone number'
    ]
  },
  countryCode: {
    type: String,
    required: [true, 'Please add a country code'],
    default: '+1'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: '/user.png'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  socialLinks: {
    twitter: String,
    instagram: String
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  emailVerificationOTP: String,
  // Phone verification
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationOTP: String,
  phoneVerificationExpire: Date,
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  // Login tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  // Two-factor authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  // Profile completion
  profileCompleted: {
    type: Boolean,
    default: false
  },
  // Follow functionality
  following: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for better performance (email, phone, and username indexes are created by unique: true)
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ phoneVerificationOTP: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash email verification token
userSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire
  this.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return verificationToken;
};

// Generate phone verification OTP
userSchema.methods.getPhoneVerificationOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to phoneVerificationOTP field
  this.phoneVerificationOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expire
  this.phoneVerificationExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

  return otp;
};

// Generate email verification OTP
userSchema.methods.getEmailVerificationOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to emailVerificationOTP field
  this.emailVerificationOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expire
  this.emailVerificationExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

  return otp;
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Virtual for user stats
userSchema.virtual('stats').get(function() {
  return {
    blogsCount: 0, // This would be populated by aggregation
    followersCount: this.followers.length,
    followingCount: this.following.length,
    totalLikes: 0
  };
});

// Virtual for full verification status
userSchema.virtual('isFullyVerified').get(function() {
  return this.isEmailVerified && this.isPhoneVerified;
});

// Static method to check if username is available
userSchema.statics.isUsernameAvailable = async function(username) {
  const user = await this.findOne({ username: username.toLowerCase() });
  return !user;
};

// Static method to generate unique username from name
userSchema.statics.generateUniqueUsername = async function(name) {
  // Remove special characters and convert to lowercase
  let baseUsername = name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 20); // Limit to 20 characters

  if (baseUsername.length < 3) {
    baseUsername = 'user' + Math.random().toString(36).substring(2, 5);
  }

  let username = baseUsername;
  let counter = 1;

  // Keep trying until we find an available username
  while (await this.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 1000) {
      username = `${baseUsername}${Date.now()}`;
      break;
    }
  }

  return username;
};

// Instance method to follow a user
userSchema.methods.followUser = function(userIdToFollow) {
  if (this._id.toString() === userIdToFollow.toString()) {
    throw new Error('You cannot follow yourself');
  }
  
  if (!this.following.includes(userIdToFollow)) {
    this.following.push(userIdToFollow);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to unfollow a user
userSchema.methods.unfollowUser = function(userIdToUnfollow) {
  const index = this.following.indexOf(userIdToUnfollow);
  if (index > -1) {
    this.following.splice(index, 1);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to check if following a user
userSchema.methods.isFollowing = function(userId) {
  return this.following.includes(userId);
};

// Static method to get user's followers
userSchema.statics.getFollowers = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.findById(userId)
    .populate('followers', 'name username avatar bio')
    .select('followers')
    .then(user => {
      if (!user) return null;
      const followers = user.followers.slice(skip, skip + limit);
      return {
        followers,
        total: user.followers.length,
        page,
        limit,
        hasMore: skip + limit < user.followers.length
      };
    });
};

// Static method to get user's following
userSchema.statics.getFollowing = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.findById(userId)
    .populate('following', 'name username avatar bio')
    .select('following')
    .then(user => {
      if (!user) return null;
      const following = user.following.slice(skip, skip + limit);
      return {
        following,
        total: user.following.length,
        page,
        limit,
        hasMore: skip + limit < user.following.length
      };
    });
};

export default mongoose.model('User', userSchema); 