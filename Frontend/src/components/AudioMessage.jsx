import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

const AudioMessage = ({ audioUrl, duration, isSent = true, timestamp }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);

  // Generate a mock waveform (in a real app, this would come from the audio file)
  const generateWaveform = () => {
    const bars = [];
    const barCount = 30;
    for (let i = 0; i < barCount; i++) {
      // Random height between 10% and 100%
      const height = Math.floor(Math.random() * 90) + 10;
      bars.push(
        <div 
          key={i}
          className={`h-full w-0.5 mx-0.5 rounded-full transition-all duration-200 ${
            i / barCount < progress ? 'bg-blue-500' : 'bg-blue-300/50'
          }`}
          style={{ height: `${height}%` }}
        />
      );
    }
    return bars;
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center max-w-xs ${isSent ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`flex items-center px-4 py-2 rounded-2xl ${isSent ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
        <button
          onClick={togglePlayPause}
          className={`p-1.5 rounded-full ${isSent ? 'bg-white/20' : 'bg-gray-200'} mr-3`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        
        <div className="flex-1 flex items-center h-6">
          <div className="flex items-end h-full w-32 mr-3">
            {generateWaveform()}
          </div>
        </div>
        
        <span className={`text-xs ${isSent ? 'text-white/80' : 'text-gray-500'}`}>
          {formatTime(duration || 0)}
        </span>
        
        <audio ref={audioRef} src={audioUrl} className="hidden" />
      </div>
      
      {timestamp && (
        <span className={`text-xs mt-1 ${isSent ? 'text-right' : 'text-left'} w-full text-gray-500`}>
          {timestamp}
        </span>
      )}
    </div>
  );
};

export default AudioMessage;
