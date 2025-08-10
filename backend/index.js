import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import blogRoutes from './routes/blogs.js';
import commentRoutes from './routes/comments.js';
import uploadRoutes from './routes/upload.js';
import messageRoutes from './routes/messages.js';
import activityRoutes from './routes/activity.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { auth } from './middleware/auth.js';

// Import SMS service
import smsService from './utils/smsService.js';

// Debug: Check if important environment variables are loaded
console.log('\n' + '='.repeat(50));
console.log('🔧 ENVIRONMENT VARIABLES CHECK');
console.log('='.repeat(50));

const requiredVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'RESEND_API_KEY'
];

// Set default JWT_EXPIRE if not provided
if (!process.env.JWT_EXPIRE) {
  process.env.JWT_EXPIRE = '30d'; // Default to 30 days
  console.log('✅ JWT_EXPIRE set to default: 30d');
}

// Set default JWT_COOKIE_EXPIRE if not provided
if (!process.env.JWT_COOKIE_EXPIRE) {
  process.env.JWT_COOKIE_EXPIRE = 30; // Default to 30 days
  console.log('✅ JWT_COOKIE_EXPIRE set to default: 30 days');
}

let allLoaded = true;
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ ${varName} not found in environment variables`);
    allLoaded = false;
  } else {
    console.log(`✅ ${varName} loaded successfully`);
  }
});

if (!allLoaded) {
  console.error('\n❌ Some required environment variables are missing!');
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('='.repeat(50) + '\n');

// Reinitialize Twilio after environment variables are loaded
smsService.reinitializeTwilio();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve uploads directory for image access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', auth, uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/activity', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'StoryShare API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/storyshare');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();

  const http = await import('http');
  const { setupSocket } = await import('./socket.js');
  const server = http.createServer(app);
  setupSocket(server);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 StoryShare API ready at http://localhost:${PORT}`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
};

startServer();

export default app; 