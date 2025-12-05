import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCcw, Lightbulb, Check } from "lucide-react";

type Board = (number | null)[][];
type SelectedCell = { row: number; col: number } | null;

// Sudoku puzzles (0 = empty)
const PUZZLES: number[][][] = [
  [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0],
  ],
];

const SOLUTIONS: number[][][] = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
  [
    [4, 3, 5, 2, 6, 9, 7, 8, 1],
    [6, 8, 2, 5, 7, 1, 4, 9, 3],
    [1, 9, 7, 8, 3, 4, 5, 6, 2],
    [8, 2, 6, 1, 9, 5, 3, 4, 7],
    [3, 7, 4, 6, 8, 2, 9, 1, 5],
    [9, 5, 1, 7, 4, 3, 6, 2, 8],
    [5, 1, 9, 3, 2, 6, 8, 7, 4],
    [2, 4, 8, 9, 5, 7, 1, 3, 6],
    [7, 6, 3, 4, 1, 8, 2, 5, 9],
  ],
];

interface SudokuGameProps {
  onBack: () => void;
}

const SudokuGame = ({ onBack }: SudokuGameProps) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(3);
  const [isComplete, setIsComplete] = useState(false);
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());

  const initGame = useCallback((index: number) => {
    const puzzle = PUZZLES[index].map(row => row.map(cell => cell === 0 ? null : cell));
    setBoard(puzzle);
    setInitialBoard(puzzle.map(row => [...row]));
    setSelectedCell(null);
    setMistakes(0);
    setHints(3);
    setIsComplete(false);
    setInvalidCells(new Set());
  }, []);

  useEffect(() => {
    initGame(puzzleIndex);
  }, [puzzleIndex, initGame]);

  const isValidPlacement = useCallback((board: Board, row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && board[row][x] === num) return false;
    }

    // Check column
    for (let y = 0; y < 9; y++) {
      if (y !== row && board[y][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let y = boxRow; y < boxRow + 3; y++) {
      for (let x = boxCol; x < boxCol + 3; x++) {
        if ((y !== row || x !== col) && board[y][x] === num) return false;
      }
    }

    return true;
  }, []);

  const checkComplete = useCallback((currentBoard: Board): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!currentBoard[row][col]) return false;
        if (!isValidPlacement(currentBoard, row, col, currentBoard[row][col]!)) return false;
      }
    }
    return true;
  }, [isValidPlacement]);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] !== null) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || initialBoard[selectedCell.row][selectedCell.col] !== null) return;

    const newBoard = board.map(row => [...row]);
    const { row, col } = selectedCell;

    if (num === 0) {
      newBoard[row][col] = null;
      setInvalidCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${row}-${col}`);
        return newSet;
      });
    } else {
      newBoard[row][col] = num;
      
      const solution = SOLUTIONS[puzzleIndex];
      if (num !== solution[row][col]) {
        setMistakes(prev => prev + 1);
        setInvalidCells(prev => new Set(prev).add(`${row}-${col}`));
      } else {
        setInvalidCells(prev => {
          const newSet = new Set(prev);
          newSet.delete(`${row}-${col}`);
          return newSet;
        });
      }
    }

    setBoard(newBoard);

    if (checkComplete(newBoard)) {
      setIsComplete(true);
    }
  };

  const useHint = () => {
    if (hints <= 0 || !selectedCell) return;
    
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const solution = SOLUTIONS[puzzleIndex];
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];
    
    setBoard(newBoard);
    setHints(prev => prev - 1);
    setInvalidCells(prev => {
      const newSet = new Set(prev);
      newSet.delete(`${row}-${col}`);
      return newSet;
    });

    if (checkComplete(newBoard)) {
      setIsComplete(true);
    }
  };

  const newGame = () => {
    setPuzzleIndex(prev => (prev + 1) % PUZZLES.length);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleNumberInput(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, board]);

  const getCellBackground = (row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInitial = initialBoard[row]?.[col] !== null;
    const isInvalid = invalidCells.has(`${row}-${col}`);
    const isSameNumber = selectedCell && board[row][col] && board[row][col] === board[selectedCell.row]?.[selectedCell.col];
    const isInSameRowColBox = selectedCell && (
      row === selectedCell.row || 
      col === selectedCell.col ||
      (Math.floor(row / 3) === Math.floor(selectedCell.row / 3) && Math.floor(col / 3) === Math.floor(selectedCell.col / 3))
    );

    if (isSelected) return "hsl(var(--primary) / 0.3)";
    if (isInvalid) return "hsl(var(--destructive) / 0.2)";
    if (isSameNumber) return "hsl(var(--primary) / 0.15)";
    if (isInSameRowColBox) return "hsl(var(--primary) / 0.08)";
    if (isInitial) return "hsl(var(--muted) / 0.8)";
    return "hsl(var(--card))";
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
          <h2 className="font-display font-bold text-2xl text-gradient">Sudoku</h2>
          <button onClick={newGame} className="btn-back p-3">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-4 text-sm font-medium">
          <span className="bg-muted px-4 py-2 rounded-full">Mistakes: {mistakes}/3</span>
          <button 
            onClick={useHint}
            disabled={hints <= 0 || !selectedCell}
            className="bg-muted px-4 py-2 rounded-full flex items-center gap-2 disabled:opacity-50 transition-opacity"
          >
            <Lightbulb className="w-4 h-4" />
            Hints: {hints}
          </button>
        </div>

        {/* Game Board */}
        <div className="relative bg-foreground/10 rounded-xl p-2 mb-4">
          <div className="grid grid-cols-9 gap-0.5">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`
                    aspect-square flex items-center justify-center font-display font-semibold text-lg
                    transition-all duration-150 rounded-sm
                    ${colIndex % 3 === 2 && colIndex !== 8 ? 'mr-1' : ''}
                    ${rowIndex % 3 === 2 && rowIndex !== 8 ? 'mb-1' : ''}
                    ${initialBoard[rowIndex]?.[colIndex] !== null ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}
                  `}
                  style={{
                    backgroundColor: getCellBackground(rowIndex, colIndex),
                    color: invalidCells.has(`${rowIndex}-${colIndex}`) 
                      ? 'hsl(var(--destructive))' 
                      : initialBoard[rowIndex]?.[colIndex] !== null 
                      ? 'hsl(var(--foreground))' 
                      : 'hsl(var(--primary))',
                  }}
                >
                  {cell}
                </button>
              ))
            )}
          </div>

          {/* Complete / Game Over Overlay */}
          {(isComplete || mistakes >= 3) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4">
              <p className="font-display font-bold text-2xl">
                {isComplete ? "Congratulations! 🎉" : "Game Over!"}
              </p>
              {isComplete && (
                <div className="flex items-center gap-2 text-secondary">
                  <Check className="w-6 h-6" />
                  <span>Puzzle Solved!</span>
                </div>
              )}
              <button onClick={newGame} className="btn-game flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                New Puzzle
              </button>
            </div>
          )}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="btn-back aspect-square text-xl font-display font-semibold"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberInput(0)}
            className="btn-back aspect-square text-sm font-medium"
          >
            Clear
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Tap a cell, then tap a number • Use keyboard 1-9 or click
        </p>
      </div>
    </div>
  );
};

export default SudokuGame;
