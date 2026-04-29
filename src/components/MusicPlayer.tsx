import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

const TRACKS = [
  { id: 1, title: 'Cyber Drifter', artist: 'AI_CORE_01', duration: '04:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Neon Pulse', artist: 'AI_CORE_02', duration: '03:45', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Data Stream', artist: 'AI_CORE_03', duration: '05:10', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

export const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const handlePrev = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
      setCurrentTimeStr(formatTime(current));
    }
  };

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-4">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        loop={false}
      />

      <div className="flex-1 neon-border bg-[#080810] p-4 flex flex-col">
        <h3 className="text-xs font-bold uppercase text-[#ff00ff] mb-4 tracking-tighter border-b border-[#ff00ff]/30 pb-2">
          Now Playing
        </h3>
        
        <div className="mb-6 text-center">
          <motion.div 
            className="w-32 h-32 mx-auto neon-border neon-pink rounded-full flex items-center justify-center p-2 mb-4"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full border border-[#ff00ff]/20 flex items-center justify-center">
              <div className="w-4 h-4 bg-[#ff00ff] rounded-full"></div>
            </div>
          </motion.div>
          <h4 className="text-lg neon-text truncate">{currentTrack.title}</h4>
          <p className="text-xs text-cyan-600">Artist: {currentTrack.artist}</p>
        </div>

        <div className="space-y-2 flex-1 overflow-hidden">
          {TRACKS.map((track, i) => (
            <div 
              key={track.id} 
              className={`p-2 text-xs flex justify-between cursor-pointer ${
                i === currentTrackIndex 
                  ? 'bg-[#00f3ff]/10 border border-[#00f3ff]/40' 
                  : 'border border-transparent opacity-50 hover:opacity-100'
              }`}
              onClick={() => {
                setCurrentTrackIndex(i);
                setIsPlaying(true);
              }}
            >
              <span>0{i + 1}. {track.title}</span>
              <span className={i === currentTrackIndex ? "text-cyan-600" : ""}>{track.duration}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-32 neon-border bg-[#080810] p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center px-4">
          <button onClick={handlePrev} className="w-8 h-8 rounded-full border border-[#00f3ff]/30 flex items-center justify-center text-[10px] hover:bg-[#00f3ff]/10 hover:neon-border">
            PREV
          </button>
          <button onClick={togglePlay} className="w-12 h-12 rounded-full neon-border bg-[#00f3ff]/20 flex items-center justify-center text-xs hover:bg-[#00f3ff]/40">
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          <button onClick={handleNext} className="w-8 h-8 rounded-full border border-[#00f3ff]/30 flex items-center justify-center text-[10px] hover:bg-[#00f3ff]/10 hover:neon-border">
            NEXT
          </button>
        </div>
        
        <div className="w-full bg-[#00f3ff]/10 h-1 relative mt-4">
          <div 
            className="absolute left-0 top-0 h-full bg-[#00f3ff] shadow-[0_0_5px_#00f3ff]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-cyan-700 mt-2">
          <span>{currentTimeStr}</span>
          <span>{currentTrack.duration}</span>
        </div>
      </div>
    </aside>
  );
};
