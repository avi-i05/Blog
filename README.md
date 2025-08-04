# StoryShare - Blog Platform with Comprehensive Authentication

A modern blog platform built with React, Node.js, and MongoDB featuring a comprehensive authentication system with email and phone verification.

## 🚀 Features

### Authentication System
- **Email Verification**: Secure email verification with token-based validation
- **Phone Verification**: SMS OTP verification using Twilio
- **Password Reset**: Secure password reset via email
- **Account Security**: 
  - Account locking after failed login attempts
  - Rate limiting for API endpoints
  - JWT token-based authentication
  - Password strength validation
- **Profile Management**: Complete user profile with social links
- **Two-Factor Authentication**: Ready for future 2FA implementation

### Blog Features
- **Create & Edit**: Rich text editor for blog creation
- **Categories**: Organize content by categories
- **Comments**: Interactive commenting system
- **User Profiles**: Comprehensive user profiles with stats
- **Responsive Design**: Mobile-first responsive design
- **Dark Mode**: Toggle between light and dark themes

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email services
- **Twilio** for SMS services
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Twilio Account (for SMS verification)
- Email Service (Gmail, SendGrid, etc.)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Blog-project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/storyshare

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Security
BCRYPT_ROUNDS=12
```

### 4. Frontend Setup
```bash
cd ../Frontend
npm install
```

### 5. Start Development Servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

## 🔐 Authentication Flow

### 1. Registration
1. User fills out registration form (name, email, phone, password)
2. System validates input and checks for existing users
3. User account is created with verification flags set to false
4. Email verification token is generated and sent
5. SMS OTP is generated and sent to phone number
6. User is redirected to verification pages

### 2. Email Verification
1. User clicks email verification link
2. System validates token and marks email as verified
3. If both email and phone are verified, welcome messages are sent
4. User can now access full platform features

### 3. Phone Verification
1. User enters phone number and OTP on verification page
2. System validates OTP and marks phone as verified
3. If both email and phone are verified, welcome messages are sent
4. User can now access full platform features

### 4. Login
1. User enters email and password
2. System checks for account lockout and blocked status
3. Password is verified against hashed version
4. Login attempts are tracked and account locked if necessary
5. JWT token is generated and stored
6. User is redirected to dashboard

### 5. Password Reset
1. User requests password reset via email
2. Reset token is generated and sent via email
3. User clicks reset link and enters new password
4. Password is updated and token is invalidated

## 📧 Email Templates

The system includes professionally designed email templates for:
- Email verification
- Password reset
- Welcome messages
- Account security alerts

## 📱 SMS Integration

SMS functionality includes:
- OTP verification codes
- Welcome messages
- Security alerts
- Mock SMS service for development

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive validation using Express Validator
- **Account Lockout**: Automatic account locking after failed attempts
- **CORS Protection**: Configured CORS for security
- **Helmet**: Security headers middleware
- **Token Expiration**: Configurable token expiration times

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/verify-phone` - Phone verification
- `POST /api/auth/resend-email-verification` - Resend email verification
- `POST /api/auth/resend-phone-verification` - Resend phone verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create new blog
- `GET /api/blogs/:id` - Get specific blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### Comments
- `GET /api/comments` - Get comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🎨 UI Components

### Pages
- **Landing Page**: Hero section with call-to-action
- **Login/Signup**: Authentication forms with validation
- **Email Verification**: Token-based email verification
- **Phone Verification**: OTP-based phone verification
- **Profile**: User profile management
- **Blog Feed**: Display all blogs with filtering
- **Blog Detail**: Individual blog view with comments
- **Create Blog**: Rich text editor for blog creation

### Components
- **Navbar**: Navigation with user menu
- **Footer**: Site footer with links
- **Loading Spinner**: Loading states
- **Toast Notifications**: Success/error messages

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables for production
3. Set up email service (SendGrid recommended)
4. Configure Twilio for SMS
5. Deploy to Heroku, Vercel, or AWS

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or AWS S3
3. Configure environment variables
4. Update API endpoints for production

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd Frontend
npm test
```

### Code Quality
- ESLint configuration for both frontend and backend
- Prettier formatting
- Consistent code style

## 📝 Environment Variables

### Required Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `SMTP_HOST`: Email service host
- `SMTP_USER`: Email service username
- `SMTP_PASS`: Email service password
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

### Optional Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: CORS origin URL
- `FRONTEND_URL`: Frontend URL for email links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@storyshare.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🔮 Future Enhancements

- Two-factor authentication (TOTP)
- Social media login (Google, Facebook, GitHub)
- Advanced blog features (tags, search, analytics)
- Real-time notifications
- Mobile app development
- Advanced user roles and permissions
- Content moderation tools
- Analytics dashboard 