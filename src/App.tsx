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
    <div className="min-h-screen bg-[#020004] text-[#00f3ff] font-mono relative flex flex-col p-6 overflow-hidden border-8 border-[#0a0a12]">
      <div className="static-noise"></div>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Decorative Effects */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-[#00f3ff]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[5%] w-[30vw] h-[30vw] bg-[#ff00ff]/10 rounded-full blur-[100px]" />
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
              <h1 className="text-5xl md:text-6xl font-black neon-text italic uppercase leading-none flex flex-col items-start hover-glitch">
                <span className="glitch" data-text="SYS.ERR://">SYS.ERR://</span>
                <span className="glitch text-[#ff00ff]" data-text="Ouroboros.exe">Ouroboros.exe</span>
              </h1>
              <p className="text-xl tracking-[0.2em] text-cyan-600 mt-2">FATAL.EXCEPTION: NEURAL.FEED v0.0.01</p>
            </div>

            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-sm text-cyan-600 uppercase mb-1">MEM_ALLOC</p>
                <p className="text-4xl font-bold neon-text">{score.toString().padStart(4, '0')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#ff00ff] uppercase mb-1">PEAK_CYCLE</p>
                <p className="text-4xl font-bold text-[#ff00ff]" style={{ textShadow: '2px 0 #00f3ff, -2px 0 #ff00ff' }}>
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

          <footer className="h-12 flex items-center justify-between border-t-2 border-[#ff00ff]/40 px-2 mt-auto">
            <div className="flex gap-6 text-sm text-cyan-600 font-bold uppercase">
              <span className="glitch" data-text="FPS: ERR">FPS: ERR</span>
              <span className="glitch" data-text="LATENCY: INF ms">LATENCY: INF ms</span>
              <span className="glitch" data-text="CPU: 100%">CPU: 100%</span>
            </div>
            <div className="text-sm text-[#ff00ff] glitch font-bold" data-text="OVERRIDE DETECTED > USE [WASD]">
              OVERRIDE DETECTED &gt; USE [WASD]
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
}

