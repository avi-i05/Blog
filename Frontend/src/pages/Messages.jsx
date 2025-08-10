import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Search, ArrowLeft, MoreVertical, Trash2, X, MessageSquare, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getConversations, getConversation, sendMessage, deleteMessage } from '../services/messageService';
import { getUserProfile, getUserProfileByUsername } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import AudioRecorder from '../components/AudioRecorder';
import AudioMessage from '../components/AudioMessage';
import toast from 'react-hot-toast';

const Messages = () => {
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [newConvInput, setNewConvInput] = useState('');
  const [newConvLoading, setNewConvLoading] = useState(false);
  const [newConvError, setNewConvError] = useState('');
  const location = useLocation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Handle audio recording completion
  const handleAudioReady = useCallback((audioBlob, duration) => {
    if (audioBlob && selectedConversation?.user?._id) {
      const receiverId = selectedConversation.user._id;
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio-message.webm'); // Add filename as third argument
      formData.append('duration', Math.round(duration).toString()); // Ensure duration is a string
      formData.append('receiverId', receiverId); // Add receiverId to formData
      
      // Debug: Log FormData contents
      console.log('Sending audio message with FormData:', {
        hasAudio: audioBlob instanceof Blob,
        duration: Math.round(duration),
        receiverId,
        formData: {
          hasAudio: formData.has('audio'),
          hasDuration: formData.has('duration'),
          hasReceiverId: formData.has('receiverId')
        }
      });
      
      setSending(true);
      
      // Send as audio file (third parameter isAudio=true)
      sendMessage(receiverId, formData, true)
        .then(res => {
          if (res.success) {
            // The response should contain the message with audio URL and duration
            setMessages(prev => [...prev, res.data]);
            scrollToBottom();
          } else {
            toast.error(res.error || 'Failed to send audio message');
          }
        })
        .catch(error => {
          console.error('Error sending audio message:', error);
          toast.error('Failed to send audio message');
        })
        .finally(() => {
          setSending(false);
        });
    }
  }, [selectedConversation]);

  const typingTimeout = useRef(null);
  const chatListRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toUserId = params.get('to');
    if (toUserId && conversations.length > 0) {
      let conv = conversations.find(c => c.user._id === toUserId);
      if (conv) {
        setSelectedConversation(conv);
      } else {
        setSelectedConversation({ user: { _id: toUserId }, loadingProfile: true });
        getUserProfile(toUserId)
          .then(res => {
            if (res.success) {
              setSelectedConversation({ user: res.data });
            } else {
              setSelectedConversation(null);
              toast.error(res.error || 'User not found');
            }
          });
      }
    }
  }, [location.search, conversations]);

  useEffect(() => {
    if (!user?._id) return;
    socket.connect();
    socket.emit('join', user._id);
    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    if (!selectedConversation) return;
    fetchMessages(selectedConversation.user._id);

    socket.off('receive_message');
    socket.on('receive_message', (msg) => {
      if (msg.sender._id === selectedConversation.user._id || msg.receiver._id === selectedConversation.user._id) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    });

    socket.off('typing');
    socket.off('stop_typing');
    socket.on('typing', ({ senderId }) => {
      if (selectedConversation && senderId === selectedConversation.user._id) setIsTyping(true);
    });
    socket.on('stop_typing', ({ senderId }) => {
      if (selectedConversation && senderId === selectedConversation.user._id) setIsTyping(false);
    });

    scrollToBottom();
    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, [selectedConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }
    }, 100);
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const result = await getConversations();
      if (result.success) {
        setConversations(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch conversations');
      }
    } catch (error) {
      toast.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const result = await getConversation(userId);
      if (result.success) {
        setMessages(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch messages');
      }
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    const receiverId = selectedConversation.user._id;
    const res = await sendMessage(receiverId, newMessage.trim());
    setSending(false);
    if (res.success) {
      setNewMessage('');
      setMessages(prev => [...prev, res.data]);
      scrollToBottom();
    } else {
      toast.error(res.error || 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!selectedConversation) return;
    socket.emit('typing', { receiverId: selectedConversation.user._id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { receiverId: selectedConversation.user._id });
    }, 1200);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const result = await deleteMessage(messageId);
      if (result.success) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        toast.success('Message deleted');
      } else {
        toast.error(result.error || 'Failed to delete message');
      }
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const startNewConversation = async () => {
    setNewConvLoading(true);
    setNewConvError('');
    let res;
    if (!newConvInput.match(/^[0-9a-fA-F]{24}$/)) {
      res = await getUserProfileByUsername(newConvInput.trim());
    } else {
      res = await getUserProfile(newConvInput.trim());
    }
    setNewConvLoading(false);
    if (res && res.success) {
      setSelectedConversation({ user: res.data });
      setShowNewConvModal(false);
      setNewConvInput('');
    } else {
      setNewConvError(res?.error || 'User not found');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto h-[90vh] md:h-[85vh] rounded-2xl shadow-xl flex overflow-hidden mt-4 md:mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">

        {/* Sidebar */}
        <div className="w-full md:w-1/3 min-w-[260px] max-w-xs border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Chats</h1>
            <button 
              onClick={() => setShowNewConvModal(true)} 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            >
              <span className="text-lg">+</span> New
            </button>
          </div>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-700/80 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-400">
            {filteredConversations.length ? filteredConversations.map((conversation) => (
              <motion.div 
                key={conversation.user._id} 
                onClick={() => setSelectedConversation(conversation)} 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 ${
                  selectedConversation?.user._id === conversation.user._id 
                    ? 'bg-blue-50 dark:bg-gray-700 border-r-4 border-blue-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="relative">
                  <img 
                    src={conversation.user.avatar} 
                    alt={conversation.user.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700" 
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conversation.user.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-sm mt-1">
                  {searchTerm ? 'Try a different search' : 'Start a new conversation'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative bg-gray-50 dark:bg-gray-800">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-1"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                
                <div className="relative">
                  <img 
                    src={selectedConversation.user.avatar} 
                    alt={selectedConversation.user.name} 
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700" 
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                    {selectedConversation.user.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{selectedConversation.user.username}
                  </p>
                </div>
                
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Messages */}
              <div 
                ref={chatListRef} 
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-700/60 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-400"
                style={{ 
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'thin',
                  scrollbarGutter: 'stable',
                  scrollbarColor: '#d1d5db #f3f4f6',
                }}
              >
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.sender._id === user._id;
                  const isSameSender = index > 0 && messages[index - 1].sender._id === msg.sender._id;
                  
                  return (
                    <motion.div 
                      key={msg._id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                        isSameSender ? 'mt-1' : 'mt-4'
                      }`}
                    >
                      {msg.audio ? (
                        <div className="max-w-[85%] md:max-w-[65%]">
                          <AudioMessage 
                            audioUrl={msg.audio.url}
                            duration={msg.audio.duration}
                            isSent={isCurrentUser}
                            timestamp={formatTime(msg.createdAt)}
                          />
                          {isCurrentUser && (
                            <div className="flex justify-end mt-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMessage(msg._id);
                                }} 
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full"
                                aria-label="Delete message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className={`relative px-4 py-2 rounded-2xl max-w-[85%] md:max-w-[65%] ${
                            isCurrentUser 
                              ? 'bg-blue-500 text-white rounded-br-none' 
                              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm'
                          }`}
                          style={{
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          {!isCurrentUser && !isSameSender && (
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              {msg.sender.name}
                            </p>
                          )}
                          <div className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content.split('\n').map((line, i, arr) => (
                              <p key={i} className={i < arr.length - 1 ? 'mb-2' : ''}>
                                {line || <br />}
                              </p>
                            ))}
                          </div>
                          <div 
                            className={`flex items-center justify-end mt-2 space-x-2 text-xs ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                            }`}
                            style={{
                              opacity: 0.8
                            }}
                          >
                            <span className="text-[0.7rem]">{formatTime(msg.createdAt)}</span>
                            {isCurrentUser && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMessage(msg._id);
                                }} 
                                className="opacity-0 group-hover:opacity-70 transition-opacity p-1 hover:opacity-100 hover:bg-opacity-20 hover:bg-white rounded-full"
                                aria-label="Delete message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-700 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-bounce" style={{ animationDuration: '0.8s' }} />
                      <span className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.4s' }} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <form onSubmit={handleSendMessage} className="w-full">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <div className="relative">
                        <textarea 
                          value={newMessage} 
                          onChange={e => { 
                            setNewMessage(e.target.value);
                            handleTyping();
                            e.target.style.height = 'auto';
                            const lineHeight = 24; 
                            const maxHeight = lineHeight * 4;
                            const newHeight = Math.min(e.target.scrollHeight, maxHeight);
                            e.target.style.height = `${newHeight}px`;
                            
                            if (e.target.scrollHeight > maxHeight) {
                              e.target.style.overflowY = 'auto';
                            } else {
                              e.target.style.overflowY = 'hidden';
                            }
                          }} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (newMessage.trim()) {
                                handleSendMessage(e);
                                e.target.style.height = '48px';
                                e.target.style.overflowY = 'hidden';
                              }
                            }
                          }}
                          rows={1}
                          maxLength={1000}
                          placeholder="Type a message..." 
                          className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500"
                          style={{ 
                            minHeight: '48px', 
                            maxHeight: '96px', 
                            lineHeight: '1.5',
                            paddingRight: '3.5rem',
                            overflowY: 'hidden' 
                          }}
                        />
                      </div>
                    </div>
                    
                    {newMessage.trim() ? (
                      <button 
                        type="submit" 
                        disabled={sending} 
                        className={`p-2.5 rounded-full flex-shrink-0 ${
                          sending
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105 transition-all'
                        }`}
                        aria-label="Send message"
                      >
                        {sending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    ) : (
                      <div className="p-2.5">
                        <AudioRecorder 
                          onAudioReady={handleAudioReady}
                        />
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-400">No conversations yet</div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConvModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <input type="text" value={newConvInput} onChange={e => setNewConvInput(e.target.value)} placeholder="Enter username or ID" className="w-full border px-4 py-2 rounded-lg mb-3" disabled={newConvLoading} />
            {newConvError && <div className="text-red-500 text-sm mb-3">{newConvError}</div>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewConvModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={startNewConversation} disabled={newConvLoading || !newConvInput.trim()} className="px-4 py-2 bg-blue-500 text-white rounded">Start</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
