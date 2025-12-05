import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, RotateCw, ArrowDown, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 800;

type Cell = string | null;
type Board = Cell[][];

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: "hsl(200, 80%, 60%)" },
  O: { shape: [[1, 1], [1, 1]], color: "hsl(45, 100%, 60%)" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "hsl(280, 70%, 60%)" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "hsl(120, 60%, 50%)" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "hsl(0, 80%, 60%)" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "hsl(220, 80%, 60%)" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "hsl(30, 90%, 55%)" },
};

type TetrominoKey = keyof typeof TETROMINOES;

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

const createEmptyBoard = (): Board => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

const randomTetromino = (): Piece => {
  const keys = Object.keys(TETROMINOES) as TetrominoKey[];
  const key = keys[Math.floor(Math.random() * keys.length)];
  const tetromino = TETROMINOES[key];
  return {
    shape: tetromino.shape.map(row => [...row]),
    color: tetromino.color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
    y: 0,
  };
};

const rotatePiece = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = [];
  for (let i = 0; i < cols; i++) {
    rotated[i] = [];
    for (let j = rows - 1; j >= 0; j--) {
      rotated[i].push(shape[j][i]);
    }
  }
  return rotated;
};

interface TetrisGameProps {
  onBack: () => void;
}

const TetrisGame = ({ onBack }: TetrisGameProps) => {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [piece, setPiece] = useState<Piece>(randomTetromino);
  const [nextPiece, setNextPiece] = useState<Piece>(randomTetromino);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number | null>(null);

  const isValidMove = useCallback((testPiece: Piece, testBoard: Board): boolean => {
    for (let y = 0; y < testPiece.shape.length; y++) {
      for (let x = 0; x < testPiece.shape[y].length; x++) {
        if (testPiece.shape[y][x]) {
          const newX = testPiece.x + x;
          const newY = testPiece.y + y;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;
          if (newY >= 0 && testBoard[newY][newX]) return false;
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }

    // Check for completed lines
    let clearedLines = 0;
    const filteredBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        clearedLines++;
        return false;
      }
      return true;
    });

    while (filteredBoard.length < BOARD_HEIGHT) {
      filteredBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    if (clearedLines > 0) {
      const points = [0, 100, 300, 500, 800][clearedLines] || 0;
      setScore(prev => prev + points);
      setLines(prev => prev + clearedLines);
    }

    setBoard(filteredBoard);

    // Spawn new piece
    const newPiece = nextPiece;
    newPiece.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2);
    newPiece.y = 0;

    if (!isValidMove(newPiece, filteredBoard)) {
      setGameOver(true);
    } else {
      setPiece(newPiece);
      setNextPiece(randomTetromino());
    }
  }, [board, piece, nextPiece, isValidMove]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (gameOver || isPaused) return;
    const newPiece = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (isValidMove(newPiece, board)) {
      setPiece(newPiece);
    } else if (dy > 0) {
      placePiece();
    }
  }, [piece, board, isValidMove, placePiece, gameOver, isPaused]);

  const rotate = useCallback(() => {
    if (gameOver || isPaused) return;
    const rotatedShape = rotatePiece(piece.shape);
    let newPiece = { ...piece, shape: rotatedShape };
    
    // Wall kick
    if (!isValidMove(newPiece, board)) {
      newPiece.x = piece.x - 1;
      if (!isValidMove(newPiece, board)) {
        newPiece.x = piece.x + 1;
        if (!isValidMove(newPiece, board)) {
          return;
        }
      }
    }
    setPiece(newPiece);
  }, [piece, board, isValidMove, gameOver, isPaused]);

  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return;
    let newY = piece.y;
    while (isValidMove({ ...piece, y: newY + 1 }, board)) {
      newY++;
    }
    setPiece(prev => ({ ...prev, y: newY }));
  }, [piece, board, isValidMove, gameOver, isPaused]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setPiece(randomTetromino());
    setNextPiece(randomTetromino());
    setScore(0);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
  };

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const speed = Math.max(100, INITIAL_SPEED - lines * 20);
    
    gameLoopRef.current = window.setInterval(() => {
      movePiece(0, 1);
    }, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [movePiece, gameOver, isPaused, lines]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") movePiece(-1, 0);
      if (e.key === "ArrowRight") movePiece(1, 0);
      if (e.key === "ArrowDown") movePiece(0, 1);
      if (e.key === "ArrowUp") rotate();
      if (e.key === " ") hardDrop();
      if (e.key === "p" || e.key === "P") setIsPaused(prev => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePiece, rotate, hardDrop]);

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }

    return displayBoard;
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
          <h2 className="font-display font-bold text-2xl text-gradient">Tetris</h2>
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
          <span className="bg-muted px-4 py-2 rounded-full">Lines: {lines}</span>
        </div>

        {/* Game Board */}
        <div className="relative bg-foreground/5 rounded-xl p-2 mb-4">
          <div 
            className="grid gap-0.5"
            style={{ 
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            }}
          >
            {renderBoard().map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className="aspect-square rounded-sm transition-all duration-100"
                  style={{
                    backgroundColor: cell || 'hsl(var(--muted) / 0.5)',
                    boxShadow: cell ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none',
                  }}
                />
              ))
            )}
          </div>

          {/* Game Over / Paused Overlay */}
          {(gameOver || isPaused) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4">
              <p className="font-display font-bold text-2xl">
                {gameOver ? "Game Over!" : "Paused"}
              </p>
              {gameOver && (
                <button onClick={resetGame} className="btn-game flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-3 md:hidden">
          <button onClick={() => movePiece(-1, 0)} className="btn-back p-4">
            <ArrowLeft className="w-6 h-6 mx-auto" />
          </button>
          <button onClick={rotate} className="btn-back p-4">
            <RotateCw className="w-6 h-6 mx-auto" />
          </button>
          <button onClick={() => movePiece(1, 0)} className="btn-back p-4">
            <ArrowRight className="w-6 h-6 mx-auto" />
          </button>
          <div />
          <button onClick={() => movePiece(0, 1)} className="btn-back p-4">
            <ArrowDown className="w-6 h-6 mx-auto" />
          </button>
          <button onClick={hardDrop} className="btn-back p-4 text-xs font-bold">
            DROP
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 hidden md:block">
          Use arrow keys to move • Up to rotate • Space to drop • P to pause
        </p>
      </div>
    </div>
  );
};

export default TetrisGame;
