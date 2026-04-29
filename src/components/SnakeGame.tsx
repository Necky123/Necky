import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 20;

export type Point = { x: number; y: number };

export const SKINS = [
  { id: 'cyan', name: 'Cyber Blue', color: '#00f3ff', shadow: 'rgba(0, 243, 255, 0.5)' },
  { id: 'pink', name: 'Neon Pink', color: '#ff00ff', shadow: 'rgba(255, 0, 255, 0.5)' },
  { id: 'green', name: 'Toxic Green', color: '#4ade80', shadow: 'rgba(74, 222, 128, 0.5)' },
  { id: 'yellow', name: 'Solar Yellow', color: '#facc15', shadow: 'rgba(250, 204, 21, 0.5)' },
];

export type EnemySnake = {
  id: number;
  body: Point[];
  direction: Point;
};

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
}

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const generateFood = (snake: Point[], enemies: EnemySnake[] = []): Point => {
  let newFood: Point;
  let isOccupied = true;
  let loopCount = 0;
  while (isOccupied && loopCount < 100) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    isOccupied = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) || 
                 enemies.some(e => e.body.some(pt => pt.x === newFood.x && pt.y === newFood.y));
    loopCount++;
  }
  return newFood!;
};

export const SnakeGame: React.FC<SnakeGameProps> = ({ onScoreChange }) => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [enemies, setEnemies] = useState<EnemySnake[]>([]);
  const [selectedSkinId, setSelectedSkinId] = useState<string>('cyan');
  
  const currentSkin = SKINS.find(s => s.id === selectedSkinId) || SKINS[0];

  const [bossState, setBossState] = useState<{ active: boolean; x: number; y: number; ticksLeft: number; cleared: boolean }>({ active: false, x: -1, y: -1, ticksLeft: 0, cleared: false });
  const tickCountRef = useRef(0);

  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  
  const directionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setEnemies([]);
    setBossState({ active: false, x: -1, y: -1, ticksLeft: 0, cleared: false });
    tickCountRef.current = 0;
    setScore(0);
    onScoreChange(0);
    setFood(generateFood(INITIAL_SNAKE, []));
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!hasStarted) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        startGame();
      }
      return;
    }

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      setIsPaused(prev => !prev);
      return;
    }

    const currDir = directionRef.current;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (currDir.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (currDir.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (currDir.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (currDir.x !== -1) setDirection({ x: 1, y: 0 });
        break;
    }
  }, [hasStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isGameOver || isPaused || !hasStarted) return;

    const moveSnake = () => {
      tickCountRef.current++;
      const currentSpeed = Math.max(70, 150 - Math.floor(score / 50) * 10);

      const head = snake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setIsGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snake];
      let newScore = score;
      let nextFood = food;
      
      let nextEnemies = [...enemies];
      let nextBossState = { ...bossState };

      if (newScore >= 100 && !nextBossState.active && !nextBossState.cleared) {
        nextBossState.active = true;
        nextBossState.x = GRID_SIZE / 2;
        nextBossState.y = GRID_SIZE / 2;
        if (Math.abs(nextBossState.x - newHead.x) < 4) {
           nextBossState.x = 2;
           nextBossState.y = 2;
        }
        nextBossState.ticksLeft = Math.floor(15000 / currentSpeed);
      }

      if (newHead.x === food.x && newHead.y === food.y) {
        newScore = score + 10;
        setScore(newScore);
        onScoreChange(newScore);
        nextFood = generateFood(newSnake, nextEnemies);
      } else {
        newSnake.pop(); 
      }

      if (nextBossState.active) {
         nextEnemies = [];
         nextBossState.ticksLeft -= 1;
         
         if (nextBossState.ticksLeft <= 0) {
            nextBossState.active = false;
            nextBossState.cleared = true;
            newScore += 500;
            setScore(newScore);
            onScoreChange(newScore);
         } else {
            if (tickCountRef.current % 3 === 0) { 
                let destX = nextBossState.x;
                let destY = nextBossState.y;
                const dx = newHead.x - nextBossState.x;
                const dy = newHead.y - nextBossState.y;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                   destX += dx > 0 ? 1 : -1;
                } else if (dy !== 0) {
                   destY += dy > 0 ? 1 : -1;
                } else {
                   destX += dx > 0 ? 1 : -1;
                }
                destX = Math.max(1, Math.min(GRID_SIZE - 2, destX));
                destY = Math.max(1, Math.min(GRID_SIZE - 2, destY));
                nextBossState.x = destX;
                nextBossState.y = destY;
            }
         }
      } else if (!nextBossState.cleared || nextBossState.cleared) {
         if (tickCountRef.current % 2 === 0) {
            const foodsEaten = newScore / 10;
            let maxEnemies = 0;
            if (foodsEaten > 0 && foodsEaten % 4 === 0) {
               maxEnemies = Math.floor(foodsEaten / 4);
            }
            
            if (nextEnemies.length > maxEnemies) {
               nextEnemies = nextEnemies.slice(0, maxEnemies);
            }

            if (nextEnemies.length < maxEnemies) {
              for(let i=0; i<30; i++) {
                const ex = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                const ey = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                const distToPlayer = Math.abs(ex - newHead.x) + Math.abs(ey - newHead.y);
                if (distToPlayer > 8) {
                   const isOccupied = 
                     newSnake.some(segment => segment.x === ex && segment.y === ey) ||
                     nextEnemies.some(e => e.body.some(pt => pt.x === ex && pt.y === ey));

                   if (!isOccupied) {
                      nextEnemies.push({
                         id: Date.now() + Math.random(),
                         body: [{x: ex, y: ey}, {x: ex, y: ey+1}, {x: ex, y: ey+2}],
                         direction: {x: 0, y: -1}
                      });
                      break;
                   }
                }
              }
            }

            nextEnemies = nextEnemies.map(enemy => {
              const eHead = enemy.body[0];
              const possibleDirs = [
                { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
              ].filter(dir => !(dir.x === -enemy.direction.x && dir.y === -enemy.direction.y));

              let bestDirs = possibleDirs.map(dir => {
                const nextPt = { x: eHead.x + dir.x, y: eHead.y + dir.y };
                let pScore = 0;
                if (nextPt.x < 0 || nextPt.x >= GRID_SIZE || nextPt.y < 0 || nextPt.y >= GRID_SIZE) {
                    pScore = -1000;
                } else if (enemy.body.some(pt => pt.x === nextPt.x && pt.y === nextPt.y)) {
                    pScore = -1000;
                } else {
                   const dist = Math.abs(nextPt.x - newHead.x) + Math.abs(nextPt.y - newHead.y);
                   pScore = -dist; 
                   pScore += (Math.random() * 3 - 1.5);
                }
                return { dir, pScore };
              });

              bestDirs.sort((a, b) => b.pScore - a.pScore);
              const nextDir = bestDirs[0].pScore > -500 ? bestDirs[0].dir : enemy.direction;
              const nextEHead = { x: eHead.x + nextDir.x, y: eHead.y + nextDir.y };

              if (nextEHead.x < 0 || nextEHead.x >= GRID_SIZE || nextEHead.y < 0 || nextEHead.y >= GRID_SIZE) {
                  return null;
              }

              const newBody = [nextEHead, ...enemy.body];
              newBody.pop();

              return { ...enemy, body: newBody, direction: nextDir };
            }).filter(Boolean) as EnemySnake[];
         }
      }

      if (nextBossState.active) {
         const hitBoss = (px: number, py: number) => {
             return px >= nextBossState.x - 1 && px <= nextBossState.x + 1 &&
                    py >= nextBossState.y - 1 && py <= nextBossState.y + 1;
         };
         if (newSnake.some(pt => hitBoss(pt.x, pt.y))) {
             setIsGameOver(true);
             return;
         }
      } else {
         const hitEnemy = nextEnemies.some(enemy => 
             newSnake.some(pt => enemy.body.some(ept => ept.x === pt.x && ept.y === pt.y))
         );
         if (hitEnemy) {
             setIsGameOver(true);
             return;
         }
      }

      setSnake(newSnake);
      setFood(nextFood);
      setEnemies(nextEnemies);
      setBossState(nextBossState);
    };

    const speed = Math.max(70, 150 - Math.floor(score / 50) * 10);
    const gameTimer = setTimeout(moveSnake, speed);
    return () => clearTimeout(gameTimer);
  }, [isGameOver, isPaused, hasStarted, food, score, onScoreChange, snake, enemies]);

  return (
    <div className="flex-1 neon-border bg-[#080810] relative grid-pattern overflow-hidden p-[1px] min-h-[400px]">
      <div className="absolute top-0 left-0 w-full p-2 flex justify-between bg-[#00f3ff]/5 border-b border-[#00f3ff]/20 text-[9px] uppercase z-20">
        <span className="flex items-center gap-2 text-[#00f3ff]">
          <span className="w-1.5 h-1.5 bg-[#00f3ff] animate-pulse"></span> Game Active: Grid {GRID_SIZE}x{GRID_SIZE}
        </span>
        <span className="text-[#00f3ff]">Level: Hardcore</span>
      </div>

      {hasStarted && bossState.active && (
         <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-30 pointer-events-none">
             <span className="text-xl font-bold uppercase text-red-500 neon-text-pink animate-pulse glitch flex gap-2 items-center" data-text="BOSS ENCOUNTER">
                BOSS ENCOUNTER
             </span>
             <div className="text-white font-mono mt-1 text-lg">
                Survive: {Math.max(1, Math.ceil((bossState.ticksLeft * Math.max(70, 150 - Math.floor(score / 50) * 10)) / 1000))}s
             </div>
         </div>
      )}

      <div 
        className="absolute inset-x-0 bottom-0 top-[33px] grid" 
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {hasStarted && snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`snake-${index}`}
              className="z-10"
              style={{
                backgroundColor: currentSkin.color,
                boxShadow: isHead ? `0 0 10px ${currentSkin.color}` : `0 0 5px ${currentSkin.shadow}`,
                opacity: isHead ? 1 : 0.8,
                gridColumn: segment.x + 1,
                gridRow: segment.y + 1,
                borderRadius: isHead ? '4px' : '2px',
                margin: '1px'
              }}
            />
          );
        })}

        {hasStarted && enemies.map(enemy => (
          enemy.body.map((segment, index) => {
            const isHead = index === 0;
            const enemyColor = '#ff2a6d';
            return (
              <div
                key={`enemy-${enemy.id}-${index}`}
                className="z-10"
                style={{
                  backgroundColor: enemyColor,
                  boxShadow: isHead ? `0 0 10px ${enemyColor}` : `0 0 5px rgba(255, 42, 109, 0.5)`,
                  opacity: isHead ? 1 : 0.8,
                  gridColumn: segment.x + 1,
                  gridRow: segment.y + 1,
                  borderRadius: isHead ? '4px' : '2px',
                  margin: '1px'
                }}
              />
            );
          })
        ))}

        {hasStarted && bossState.active && (
            <div
               className="z-20 flex flex-col justify-center items-center shadow-[0_0_30px_#f00] glitch"
               style={{
                  gridColumn: `${bossState.x} / span 3`,
                  gridRow: `${bossState.y} / span 3`,
                  padding: '2px',
               }}
               data-text="🕷️"
            >
               <div className="w-full h-full bg-red-600/80 rounded-full flex items-center justify-center animate-pulse border-2 border-red-400">
                  <span className="text-2xl drop-shadow-[0_0_10px_#f00]">🕷️</span>
               </div>
            </div>
        )}
        
        {hasStarted && (
          <div
            className="bg-[#ff00ff] shadow-[0_0_10px_#ff00ff] rounded-full animate-pulse"
            style={{
              gridColumn: food.x + 1,
              gridRow: food.y + 1,
              margin: '2px'
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#080810]/80 backdrop-blur-sm z-30"
          >
            <div className="text-center hover-glitch">
              <p className="font-mono text-xl neon-text uppercase mb-4 tracking-wider glitch" data-text="Ready to Play?">
                Ready to Play?
              </p>
              
              <div className="flex justify-center gap-2 mb-6">
                 {SKINS.map(skin => (
                   <button 
                     key={skin.id}
                     onClick={() => setSelectedSkinId(skin.id)}
                     className={`w-6 h-6 rounded-full border-2 transition-all`}
                     style={{ 
                       backgroundColor: skin.color,
                       borderColor: selectedSkinId === skin.id ? '#fff' : 'transparent',
                       boxShadow: selectedSkinId === skin.id ? `0 0 10px ${skin.color}` : 'none',
                     }}
                     title={skin.name}
                   />
                 ))}
              </div>

              <p className="font-sans text-sm text-cyan-600 mb-6">
                Use WASD or Arrow Keys to move.<br/>Avoid red seeker sequences.
              </p>
              <button 
                onClick={startGame}
                className="px-6 py-2 border border-[#00f3ff] text-[#00f3ff] font-mono tracking-widest uppercase hover:bg-[#00f3ff] hover:text-black transition-all hover:shadow-[0_0_15px_#00f3ff]"
              >
                Start Game
              </button>
            </div>
          </motion.div>
        )}

        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#080810]/90 backdrop-blur-sm z-30 hover-glitch"
          >
            <h2 className="text-4xl font-mono neon-text-pink mb-2 text-[#ff00ff] glitch" data-text="GAME OVER" style={{ textShadow: '0 0 8px #ff00ff' }}>GAME OVER</h2>
            <p className="font-mono text-cyan-400 text-lg mb-8">Score: {score}</p>
            <button 
              onClick={startGame}
              className="px-6 py-2 border border-[#ff00ff] text-[#ff00ff] font-mono tracking-widest uppercase hover:bg-[#ff00ff] hover:text-black transition-all hover:shadow-[0_0_15px_#ff00ff]"
            >
              Play Again
            </button>
          </motion.div>
        )}

        {isPaused && !isGameOver && hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-[#080810]/70 backdrop-blur-sm z-30 hover-glitch"
          >
            <h2 className="text-3xl font-mono text-[#00f3ff] tracking-[0.5em] ml-[0.5em] uppercase neon-text glitch" data-text="Paused">Paused</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 grid grid-cols-3 gap-2 z-40 opacity-50 hover:opacity-100 transition-opacity">
        <div />
        <button className="w-12 h-12 border border-[#00f3ff]/30 rounded-full flex items-center justify-center active:bg-[#00f3ff]/20 text-[#00f3ff]" onClick={() => {if (directionRef.current.y !== 1) setDirection({ x: 0, y: -1 })}}>↑</button>
        <div />
        <button className="w-12 h-12 border border-[#00f3ff]/30 rounded-full flex items-center justify-center active:bg-[#00f3ff]/20 text-[#00f3ff]" onClick={() => {if (directionRef.current.x !== 1) setDirection({ x: -1, y: 0 })}}>←</button>
        <button className="w-12 h-12 border border-[#00f3ff]/30 rounded-full flex items-center justify-center active:bg-[#00f3ff]/20 text-[#00f3ff]" onClick={() => {if (directionRef.current.y !== -1) setDirection({ x: 0, y: 1 })}}>↓</button>
        <button className="w-12 h-12 border border-[#00f3ff]/30 rounded-full flex items-center justify-center active:bg-[#00f3ff]/20 text-[#00f3ff]" onClick={() => {if (directionRef.current.x !== -1) setDirection({ x: 1, y: 0 })}}>→</button>
      </div>
    </div>
  );
};
