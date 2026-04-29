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
      className="absolute inset-0 bg-[#020004]/95 flex flex-col items-center justify-center z-50 pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="w-64 h-2 bg-cyan-950 overflow-hidden relative mb-4 border border-[#00f3ff]">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#ff00ff] shadow-[0_0_15px_#ff00ff]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ ease: "linear", duration: 0.15 }}
        />
      </div>
      <p className="text-xl neon-text tracking-[0.5em] animate-pulse glitch" data-text={`EXEC.BOOT_SEQ [${Math.min(progress, 100)}%]`}>
        EXEC.BOOT_SEQ [{Math.min(progress, 100)}%]
      </p>
      <div className="text-[#ff00ff] text-sm mt-4 glitch" data-text="WARNING: MALWARE DETECTED">WARNING: MALWARE DETECTED</div>
    </motion.div>
  );
};
