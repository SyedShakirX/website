import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight as ArrowRightIcon, RotateCcw } from "lucide-react";

const GRID_SIZE = 4;

type Board = (number | null)[][];

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: "hsl(45, 100%, 90%)", text: "hsl(30, 10%, 30%)" },
  4: { bg: "hsl(45, 100%, 85%)", text: "hsl(30, 10%, 30%)" },
  8: { bg: "hsl(30, 90%, 70%)", text: "hsl(0, 0%, 100%)" },
  16: { bg: "hsl(20, 90%, 65%)", text: "hsl(0, 0%, 100%)" },
  32: { bg: "hsl(15, 90%, 60%)", text: "hsl(0, 0%, 100%)" },
  64: { bg: "hsl(10, 90%, 55%)", text: "hsl(0, 0%, 100%)" },
  128: { bg: "hsl(50, 90%, 60%)", text: "hsl(0, 0%, 100%)" },
  256: { bg: "hsl(50, 90%, 55%)", text: "hsl(0, 0%, 100%)" },
  512: { bg: "hsl(50, 90%, 50%)", text: "hsl(0, 0%, 100%)" },
  1024: { bg: "hsl(50, 95%, 45%)", text: "hsl(0, 0%, 100%)" },
  2048: { bg: "hsl(50, 100%, 40%)", text: "hsl(0, 0%, 100%)" },
};

const createEmptyBoard = (): Board => 
  Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

const addRandomTile = (board: Board): Board => {
  const newBoard = board.map(row => [...row]);
  const emptyCells: { x: number; y: number }[] = [];
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!newBoard[y][x]) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length > 0) {
    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newBoard[y][x] = Math.random() < 0.9 ? 2 : 4;
  }

  return newBoard;
};

const initBoard = (): Board => {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
};

interface Game2048Props {
  onBack: () => void;
}

const Game2048 = ({ onBack }: Game2048Props) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const slide = (row: (number | null)[]): { newRow: (number | null)[]; points: number } => {
    let points = 0;
    const filtered = row.filter(val => val !== null) as number[];
    const merged: number[] = [];
    
    for (let i = 0; i < filtered.length; i++) {
      if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
        const mergedValue = filtered[i] * 2;
        merged.push(mergedValue);
        points += mergedValue;
        i++;
      } else {
        merged.push(filtered[i]);
      }
    }

    while (merged.length < GRID_SIZE) {
      merged.push(null as unknown as number);
    }

    return { newRow: merged, points };
  };

  const moveLeft = useCallback((currentBoard: Board): { board: Board; points: number; moved: boolean } => {
    let totalPoints = 0;
    let moved = false;
    const newBoard = currentBoard.map(row => {
      const { newRow, points } = slide(row);
      totalPoints += points;
      if (row.some((val, i) => val !== newRow[i])) moved = true;
      return newRow;
    });
    return { board: newBoard, points: totalPoints, moved };
  }, []);

  const moveRight = useCallback((currentBoard: Board): { board: Board; points: number; moved: boolean } => {
    let totalPoints = 0;
    let moved = false;
    const newBoard = currentBoard.map(row => {
      const reversed = [...row].reverse();
      const { newRow, points } = slide(reversed);
      totalPoints += points;
      const result = newRow.reverse();
      if (row.some((val, i) => val !== result[i])) moved = true;
      return result;
    });
    return { board: newBoard, points: totalPoints, moved };
  }, []);

  const transpose = (matrix: Board): Board => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };

  const moveUp = useCallback((currentBoard: Board): { board: Board; points: number; moved: boolean } => {
    const transposed = transpose(currentBoard);
    const { board: movedBoard, points, moved } = moveLeft(transposed);
    return { board: transpose(movedBoard), points, moved };
  }, [moveLeft]);

  const moveDown = useCallback((currentBoard: Board): { board: Board; points: number; moved: boolean } => {
    const transposed = transpose(currentBoard);
    const { board: movedBoard, points, moved } = moveRight(transposed);
    return { board: transpose(movedBoard), points, moved };
  }, [moveRight]);

  const checkGameOver = useCallback((currentBoard: Board): boolean => {
    // Check for empty cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!currentBoard[y][x]) return false;
      }
    }

    // Check for possible merges
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const current = currentBoard[y][x];
        if (x < GRID_SIZE - 1 && current === currentBoard[y][x + 1]) return false;
        if (y < GRID_SIZE - 1 && current === currentBoard[y + 1][x]) return false;
      }
    }

    return true;
  }, []);

  const checkWin = useCallback((currentBoard: Board): boolean => {
    return currentBoard.some(row => row.some(cell => cell === 2048));
  }, []);

  const handleMove = useCallback((direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    if (gameOver) return;

    const moveFunction = {
      UP: moveUp,
      DOWN: moveDown,
      LEFT: moveLeft,
      RIGHT: moveRight,
    }[direction];

    const { board: newBoard, points, moved } = moveFunction(board);

    if (moved) {
      const boardWithNewTile = addRandomTile(newBoard);
      setBoard(boardWithNewTile);
      setScore(prev => {
        const newScore = prev + points;
        setBestScore(best => Math.max(best, newScore));
        return newScore;
      });

      if (checkWin(boardWithNewTile) && !won) {
        setWon(true);
      }

      if (checkGameOver(boardWithNewTile)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, won, moveUp, moveDown, moveLeft, moveRight, checkGameOver, checkWin]);

  const resetGame = () => {
    setBoard(initBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace("Arrow", "").toUpperCase() as "UP" | "DOWN" | "LEFT" | "RIGHT";
        handleMove(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  // Touch controls
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) {
      if (absDx > absDy) {
        handleMove(dx > 0 ? "RIGHT" : "LEFT");
      } else {
        handleMove(dy > 0 ? "DOWN" : "UP");
      }
    }

    setTouchStart(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-6 md:p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="btn-back flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="font-display font-bold text-2xl text-gradient">2048</h2>
          <button onClick={resetGame} className="btn-back p-3">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Score */}
        <div className="flex justify-between mb-4 text-sm font-medium">
          <span className="bg-muted px-4 py-2 rounded-full">Score: {score}</span>
          <span className="bg-muted px-4 py-2 rounded-full">Best: {bestScore}</span>
        </div>

        {/* Game Board */}
        <div 
          className="relative bg-foreground/10 rounded-xl p-2 mb-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-4 gap-2">
            {board.flat().map((value, index) => {
              const colors = value ? TILE_COLORS[value] || { bg: "hsl(280, 70%, 50%)", text: "hsl(0, 0%, 100%)" } : null;
              
              return (
                <div
                  key={index}
                  className="aspect-square rounded-lg flex items-center justify-center font-display font-bold transition-all duration-150"
                  style={{
                    backgroundColor: colors?.bg || 'hsl(var(--muted) / 0.5)',
                    color: colors?.text || 'transparent',
                    fontSize: value && value >= 1000 ? '1.25rem' : value && value >= 100 ? '1.5rem' : '1.75rem',
                    transform: value ? 'scale(1)' : 'scale(0.8)',
                  }}
                >
                  {value}
                </div>
              );
            })}
          </div>

          {/* Game Over / Won Overlay */}
          {(gameOver || won) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4">
              <p className="font-display font-bold text-2xl">
                {won && !gameOver ? "You Won! 🎉" : "Game Over!"}
              </p>
              <p className="text-muted-foreground">Score: {score}</p>
              <button onClick={resetGame} className="btn-game flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                {won && !gameOver ? "Keep Playing" : "Try Again"}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-3 md:hidden">
          <div />
          <button onClick={() => handleMove("UP")} className="btn-back p-4">
            <ArrowUp className="w-6 h-6 mx-auto" />
          </button>
          <div />
          <button onClick={() => handleMove("LEFT")} className="btn-back p-4">
            <ArrowLeft className="w-6 h-6 mx-auto" />
          </button>
          <div />
          <button onClick={() => handleMove("RIGHT")} className="btn-back p-4">
            <ArrowRightIcon className="w-6 h-6 mx-auto" />
          </button>
          <div />
          <button onClick={() => handleMove("DOWN")} className="btn-back p-4">
            <ArrowDown className="w-6 h-6 mx-auto" />
          </button>
          <div />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 hidden md:block">
          Use arrow keys or swipe to move tiles
        </p>
      </div>
    </div>
  );
};

export default Game2048;
