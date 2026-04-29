import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Wait a bit after reaching 100%
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="w-64 h-1 bg-cyan-900 overflow-hidden relative mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#00f3ff] shadow-[0_0_15px_#00f3ff]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ ease: "linear", duration: 0.15 }}
        />
      </div>
      <p className="text-xs neon-text tracking-[0.5em] animate-pulse">SYNCHRONIZING AUDIO CHANNELS... {Math.min(progress, 100)}%</p>
    </motion.div>
  );
};
