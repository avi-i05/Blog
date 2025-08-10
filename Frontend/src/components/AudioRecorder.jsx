import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Trash2, Loader2, Send, Play, Pause, X, Square } from "lucide-react";
import { motion } from "framer-motion";

const AudioRecorder = ({ onAudioReady }) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pitchLevel, setPitchLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const chunksRef = useRef([]);
  const durationIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup audio analysis
  const cleanupAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
  }, []);

  // Cleanup function to stop all tracks in a stream
  const stopAllTracks = useCallback((stream) => {
    if (!stream) return;
    try {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
          console.log('Stopped track:', track.kind);
        } catch (err) {
          console.error('Error stopping track:', err);
        }
      });
    } catch (err) {
      console.error('Error in stopAllTracks:', err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('=== CLEANING UP ===');
      
      // Stop any active recording
      if (mediaRecorderRef.current?.state === 'recording') {
        console.log('Stopping active recording during cleanup...');
        mediaRecorderRef.current.stop();
      }
      
      // Clean up audio analysis
      cleanupAudioAnalysis();
      
      // Stop all media tracks if we have a stream
      if (streamRef.current) {
        console.log('Stopping all media tracks...');
        stopAllTracks(streamRef.current);
      }
      
      // Revoke object URLs to prevent memory leaks
      if (audioURL) {
        console.log('Revoking object URL...');
        URL.revokeObjectURL(audioURL);
      }
      
      // Clear intervals
      if (durationIntervalRef.current) {
        console.log('Clearing duration interval...');
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      console.log('=== CLEANUP COMPLETE ===');
    };
  }, [audioURL, cleanupAudioAnalysis, stopAllTracks]);

  // Analyze audio for visualization
  const analyzeAudio = useCallback((stream) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        const updatePitch = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
          const average = sum / dataArrayRef.current.length;
          
          setPitchLevel(Math.min(average / 100, 1));
          
          if (isRecording) {
            animationFrameRef.current = requestAnimationFrame(updatePitch);
          }
        };
        
        updatePitch();
      }
    } catch (error) {
      console.error('Error in audio analysis:', error);
      cleanupAudioAnalysis();
    }
  }, [isRecording, cleanupAudioAnalysis]);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log('=== STOP RECORDING ===');
    
    // Clear any existing intervals
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Stop the media recorder if it exists and is recording
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
    }
    
    // Clean up audio analysis
    cleanupAudioAnalysis();
    
    // Update UI state
    setIsRecording(false);
    setIsLoading(false);
  }, [cleanupAudioAnalysis]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (isRecording || isLoading) return;
    
    try {
      console.log('=== START RECORDING ===');
      setIsLoading(true);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Find supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/wav'
      ];
      
      const supportedMimeType = mimeTypes.find(type => 
        MediaRecorder.isTypeSupported(type)
      ) || '';
      
      const options = supportedMimeType ? { mimeType: supportedMimeType } : undefined;
      
      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
        
        if (chunksRef.current.length === 0) {
          console.warn('No audio data received');
          return;
        }
        
        const mimeType = mediaRecorder.mimeType || 'audio/wav';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);
        setHasAudio(true);
        setRecordingDuration(Math.floor(recordingDuration));
      };
      
      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e.error);
        alert('An error occurred while recording. Please try again.');
        stopRecording();
      };
      
      // Start recording
      mediaRecorder.start(100);
      
      // Start duration counter
      setRecordingDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Start audio analysis for visualization
      analyzeAudio(stream);
      
      // Update UI state
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
      stopRecording();
    } finally {
      setIsLoading(false);
    }
  }, [isRecording, isLoading, analyzeAudio, stopRecording]);

  // Clear recording
  const clearRecording = useCallback(() => {
    console.log('=== CLEARING RECORDING ===');
    
    // Stop any active playback
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    
    // Revoke object URL to prevent memory leaks
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    // Clear any active intervals
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Reset all states
    setAudioURL(null);
    setAudioBlob(null);
    setHasAudio(false);
    setPitchLevel(0);
    setRecordingDuration(0);
    
    // Clear the chunks array
    chunksRef.current = [];
    
    console.log('=== RECORDING CLEARED ===');
  }, [audioURL]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioPlayerRef.current) return;
    
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  // Handle playback end
  const handlePlaybackEnd = useCallback(() => {
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
    }
  }, []);
  
  // Send recording
  const sendRecording = useCallback(() => {
    if (audioBlob && onAudioReady) {
      // Pass both the audio blob and duration to the parent component
      onAudioReady(audioBlob, recordingDuration);
      clearRecording();
    }
  }, [audioBlob, onAudioReady, clearRecording, recordingDuration]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="flex items-center gap-2 w-full">
      {hasAudio ? (
        // Playback UI (after recording)
        <div className="flex items-center w-full gap-2">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
            <button 
              onClick={togglePlayPause}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors flex-shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: isPlaying ? '100%' : '0%' }}
                  transition={{ duration: recordingDuration || 1 }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {formatTime(recordingDuration)}
              </span>
            </div>
            
            <audio
              ref={audioPlayerRef}
              src={audioURL}
              onEnded={handlePlaybackEnd}
              hidden
            />
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={clearRecording}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              aria-label="Delete recording"
            >
              <X className="w-5 h-5" />
            </button>
            
            <button
              onClick={sendRecording}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              aria-label="Send recording"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Recording UI
        <div className="flex items-center w-full">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors flex-shrink-0`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
              <Square className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          
          {isRecording && (
            <div className="ml-3 flex-1 flex items-center gap-2">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pitchLevel * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {formatTime(recordingDuration)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
