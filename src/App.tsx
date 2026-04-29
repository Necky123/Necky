import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoadingScreen } from './components/LoadingScreen';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  return (
    <div className="min-h-screen bg-[#050508] text-[#00f3ff] font-mono relative flex flex-col p-6 overflow-hidden border-8 border-[#0a0a12]">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Decorative Effects */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-[#00f3ff]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[5%] w-[30vw] h-[30vw] bg-[#ff00ff]/5 rounded-full blur-[100px]" />
      </div>

      {!isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 flex-1 flex flex-col w-full h-full"
        >
          {/* Header */}
          <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-black neon-text italic uppercase leading-none flex flex-col items-start hover-glitch">
                <span className="glitch" data-text="Neon">Neon</span>
                <span className="glitch" data-text="Synth-Snake">Synth-Snake</span>
              </h1>
              <p className="text-[10px] tracking-[0.4em] text-cyan-600 mt-2">AUDIO-VISUAL NEURAL INTERFACE v4.02</p>
            </div>

            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-[10px] text-cyan-600 uppercase mb-1">Current Score</p>
                <p className="text-4xl font-bold neon-text">{score.toString().padStart(4, '0')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#ff00ff] uppercase mb-1">High Score</p>
                <p className="text-4xl font-bold text-[#ff00ff]" style={{ textShadow: '0 0 8px #ff00ff' }}>
                  {highScore.toString().padStart(4, '0')}
                </p>
              </div>
            </div>
          </header>

          {/* Main Layout Area */}
          <main className="flex-1 flex flex-col lg:flex-row gap-6 mb-6">
            <SnakeGame onScoreChange={setScore} />
            <MusicPlayer />
          </main>

          <footer className="h-12 flex items-center justify-between border-t border-[#00f3ff]/20 px-2">
            <div className="flex gap-4 text-[10px] text-cyan-600">
              <span>FPS: 60.0</span>
              <span>LATENCY: 12ms</span>
              <span>MEM: 124MB</span>
            </div>
            <div className="text-[10px] text-[#00f3ff]">
              USE [WASD] TO NAVIGATE SYSTEM
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
}

