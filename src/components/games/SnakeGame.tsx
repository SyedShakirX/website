import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight as ArrowRightIcon, Pause, Play, RotateCcw } from "lucide-react";

const GRID_SIZE = 15;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

interface SnakeGameProps {
  onBack: () => void;
}

const SnakeGame = ({ onBack }: SnakeGameProps) => {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<number | null>(null);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 7, y: 7 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  }, [generateFood]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const currentDirection = directionRef.current;

      switch (currentDirection) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setHighScore(prev => Math.max(prev, score));
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setHighScore(prev => Math.max(prev, score));
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPaused, food, score, generateFood]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
    
    gameLoopRef.current = window.setInterval(moveSnake, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, gameOver, isPaused, score]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        setIsPaused(prev => !prev);
        return;
      }

      const newDirection = (() => {
        switch (e.key) {
          case "ArrowUp": return directionRef.current !== "DOWN" ? "UP" : null;
          case "ArrowDown": return directionRef.current !== "UP" ? "DOWN" : null;
          case "ArrowLeft": return directionRef.current !== "RIGHT" ? "LEFT" : null;
          case "ArrowRight": return directionRef.current !== "LEFT" ? "RIGHT" : null;
          default: return null;
        }
      })();

      if (newDirection) {
        directionRef.current = newDirection;
        setDirection(newDirection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDirectionChange = (newDir: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT"
    };
    if (directionRef.current !== opposites[newDir]) {
      directionRef.current = newDir;
      setDirection(newDir);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-6 md:p-8 max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="btn-back flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="font-display font-bold text-2xl text-gradient">Snake</h2>
          <button 
            onClick={() => setIsPaused(prev => !prev)}
            className="btn-back p-3"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>

        {/* Score */}
        <div className="flex justify-between mb-4 text-sm font-medium">
          <span className="bg-muted px-4 py-2 rounded-full">Score: {score}</span>
          <span className="bg-muted px-4 py-2 rounded-full">Best: {highScore}</span>
        </div>

        {/* Game Board */}
        <div className="relative bg-foreground/5 rounded-xl p-2 mb-4">
          <div 
            className="grid gap-0.5"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnakeHead = snake[0].x === x && snake[0].y === y;
              const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={index}
                  className="aspect-square rounded-sm transition-all duration-100"
                  style={{
                    backgroundColor: isSnakeHead 
                      ? 'hsl(var(--primary))' 
                      : isSnakeBody 
                      ? 'hsl(var(--secondary))' 
                      : isFood 
                      ? 'hsl(var(--destructive))' 
                      : 'hsl(var(--muted) / 0.5)',
                    transform: isSnakeHead ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isSnakeHead 
                      ? '0 0 10px hsl(var(--primary) / 0.5)' 
                      : isFood 
                      ? '0 0 10px hsl(var(--destructive) / 0.5)' 
                      : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Game Over / Paused Overlay */}
          {(gameOver || isPaused) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4">
              <p className="font-display font-bold text-2xl">
                {gameOver ? "Game Over!" : "Paused"}
              </p>
              {gameOver && (
                <>
                  <p className="text-muted-foreground">Final Score: {score}</p>
                  <button onClick={resetGame} className="btn-game flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Play Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-3 md:hidden">
          <div />
          <button onClick={() => handleDirectionChange("UP")} className="btn-back p-4">
            <ArrowUp className="w-6 h-6 mx-auto" />
          </button>
          <div />
          <button onClick={() => handleDirectionChange("LEFT")} className="btn-back p-4">
            <ArrowLeft className="w-6 h-6 mx-auto" />
          </button>
          <div />
          <button onClick={() => handleDirectionChange("RIGHT")} className="btn-back p-4">
            <ArrowRightIcon className="w-6 h-6 mx-auto" />
          </button>
          <div />
          <button onClick={() => handleDirectionChange("DOWN")} className="btn-back p-4">
            <ArrowDown className="w-6 h-6 mx-auto" />
          </button>
          <div />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 hidden md:block">
          Use arrow keys to move • P to pause
        </p>
      </div>
    </div>
  );
};

export default SnakeGame;
