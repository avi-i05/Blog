import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRequiredCard from './components/AuthRequiredCard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

import StepByStepSignup from './pages/StepByStepSignup';
import CardBasedSignup from './pages/CardBasedSignup';
import ProfileCompletion from './pages/ProfileCompletion';
import BlogFeed from './pages/BlogFeed';
import BlogDetail from './pages/BlogDetail';
import CreateBlog from './pages/CreateBlog';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import EditBlog from './pages/EditBlog';
import Messages from './pages/Messages';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<StepByStepSignup />} />
                <Route path="/step-signup" element={<StepByStepSignup />} />
                <Route path="/card-signup" element={<CardBasedSignup />} />
                <Route path="/blogs" element={<BlogFeed />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/user/:username" element={<PublicProfile />} />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute from="create blog">
                      <CreateBlog />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-blog/:blogId" 
                  element={
                    <ProtectedRoute from="edit blog">
                      <EditBlog />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute from="profile">
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/complete-profile" 
                  element={
                    <ProtectedRoute from="complete profile">
                      <ProfileCompletion />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/messages" 
                  element={
                    <ProtectedRoute from="messages">
                      <Messages />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
