import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Lazy Cloudinary configuration
let cloudinaryConfigured = false;

const configureCloudinary = () => {
  if (cloudinaryConfigured) return;
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('Cloudinary config:', {
    cloud_name: cloudName,
    api_key: apiKey ? '***' : 'NOT_SET',
    api_secret: apiSecret ? '***' : 'NOT_SET'
  });

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary credentials are missing! Please check your .env file.');
    throw new Error('Cloudinary credentials are not properly configured');
  }

  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  console.log('✅ Cloudinary configured successfully');
  cloudinaryConfigured = true;
};

// Configure Cloudinary storage for images
const getImageStorage = () => {
  configureCloudinary();
  return new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: 'blog-profile-photos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    }
  });
};

// Configure Cloudinary storage for audio files
const getAudioStorage = () => {
  configureCloudinary();
  return new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: 'audio-messages',
      resource_type: 'video', // Using video type for better compatibility with audio
      allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'mp4'],
      format: 'mp3', // Convert all audio to mp3 for consistency
      chunk_size: 6000000, // 6MB chunks for larger audio files
      eager: [
        { format: 'mp3', audio_codec: 'mp3' },
        { format: 'm4a', audio_codec: 'aac' }
      ]
    }
  });
};

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer with Cloudinary storage for images
const getImageUpload = () => {
  return multer({
    storage: getImageStorage(),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });
};

// Configure multer with Cloudinary storage for audio files
const getAudioUpload = () => {
  return multer({
    storage: getAudioStorage(),
    fileFilter: (req, file, cb) => {
      // Accept audio files
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 20 * 1024 * 1024 // 20MB limit for audio files
    }
  });
};

// Middleware for single image upload
const uploadSingle = (req, res, next) => {
  const upload = getImageUpload().single('image');
  upload(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
};

// Middleware for multiple image files
const uploadMultiple = (req, res, next) => {
  const upload = getImageUpload().array('images', 10); // Max 10 files
  upload(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
};

// Middleware for single audio file upload
const uploadAudio = (req, res, next) => {
  const upload = getAudioUpload().single('audio');
  upload(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!' || error.message === 'Only audio files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Export all upload middlewares
export { 
  uploadSingle, 
  uploadMultiple, 
  uploadAudio,
  handleUploadError 
};