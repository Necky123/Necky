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

      <div className="flex-1 neon-border bg-[#0a0a0c] p-4 flex flex-col border-[#ff00ff]">
        <h3 className="text-xl font-bold uppercase text-[#00f3ff] mb-4 tracking-tighter border-b-2 border-[#00f3ff]/50 pb-2 glitch" data-text="AUDIO.CORE://">
          AUDIO.CORE://
        </h3>
        
        <div className="mb-6 text-center">
          <motion.div 
            className="w-32 h-32 mx-auto neon-border rounded-full flex items-center justify-center p-2 mb-4"
            style={{ borderColor: '#00f3ff', boxShadow: '0 0 15px rgba(0, 243, 255, 0.4)' }}
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full border-2 border-[#ff00ff]/40 flex items-center justify-center">
              <div className="w-6 h-6 bg-[#ff00ff] rounded-full shadow-[0_0_15px_#ff00ff]"></div>
            </div>
          </motion.div>
          <h4 className="text-2xl neon-text truncate text-[#ff00ff]" style={{ textShadow: '2px 0 #00f3ff, -2px 0 #ff00ff' }}>{currentTrack.title}</h4>
          <p className="text-lg text-cyan-600">SRC_{currentTrack.artist}</p>
        </div>

        <div className="space-y-4 flex-1 overflow-hidden">
          {TRACKS.map((track, i) => (
            <div 
              key={track.id} 
              className={`p-2 text-lg flex justify-between cursor-pointer transition-colors ${
                i === currentTrackIndex 
                  ? 'bg-[#ff00ff]/20 border-l-4 border-[#ff00ff] text-[#fff] shadow-[0_0_10px_rgba(255,0,255,0.3)]' 
                  : 'border border-transparent opacity-50 hover:opacity-100 hover:text-[#00f3ff]'
              }`}
              onClick={() => {
                setCurrentTrackIndex(i);
                setIsPlaying(true);
              }}
            >
              <span>{i + 1}. {track.title}</span>
              <span className={i === currentTrackIndex ? "text-[#ff00ff]" : ""}>{track.duration}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-32 neon-border bg-[#0a0a0c] p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center px-4 font-bold">
          <button onClick={handlePrev} className="w-10 h-10 rounded-sm border-2 border-[#ff00ff]/60 flex items-center justify-center text-sm hover:bg-[#ff00ff]/20 text-[#ff00ff] glitch hover-glitch" data-text="<<">
            &lt;&lt;
          </button>
          <button onClick={togglePlay} className="w-16 h-16 rounded-sm border-2 border-[#00f3ff] bg-[#00f3ff]/10 flex items-center justify-center text-xl text-[#00f3ff] hover:bg-[#00f3ff]/30 shadow-[0_0_15px_rgba(0,243,255,0.4)] glitch hover-glitch" data-text={isPlaying ? 'HALT' : 'EXEC'}>
            {isPlaying ? 'HALT' : 'EXEC'}
          </button>
          <button onClick={handleNext} className="w-10 h-10 rounded-sm border-2 border-[#ff00ff]/60 flex items-center justify-center text-sm hover:bg-[#ff00ff]/20 text-[#ff00ff] glitch hover-glitch" data-text=">>">
            &gt;&gt;
          </button>
        </div>
        
        <div className="w-full bg-[#00f3ff]/20 h-2 relative mt-4">
          <div 
            className="absolute left-0 top-0 h-full bg-[#ff00ff] shadow-[0_0_10px_#ff00ff]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-cyan-600 mt-2 font-bold">
          <span>{currentTimeStr}</span>
          <span>{currentTrack.duration}</span>
        </div>
      </div>
    </aside>
  );
};
