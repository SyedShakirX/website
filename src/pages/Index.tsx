import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import ConstructionHero from "@/components/ConstructionHero";
import GameSection from "@/components/GameSection";
import Footer from "@/components/Footer";
import TetrisGame from "@/components/games/TetrisGame";
import SnakeGame from "@/components/games/SnakeGame";
import Game2048 from "@/components/games/Game2048";
import SudokuGame from "@/components/games/SudokuGame";

type GameType = "tetris" | "snake" | "2048" | "sudoku" | null;

const Index = () => {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  const handleBack = () => setActiveGame(null);

  // Render active game
  if (activeGame === "tetris") {
    return (
      <>
        <AnimatedBackground />
        <TetrisGame onBack={handleBack} />
      </>
    );
  }

  if (activeGame === "snake") {
    return (
      <>
        <AnimatedBackground />
        <SnakeGame onBack={handleBack} />
      </>
    );
  }

  if (activeGame === "2048") {
    return (
      <>
        <AnimatedBackground />
        <Game2048 onBack={handleBack} />
      </>
    );
  }

  if (activeGame === "sudoku") {
    return (
      <>
        <AnimatedBackground />
        <SudokuGame onBack={handleBack} />
      </>
    );
  }

  // Main landing page
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      
      <main className="flex-1">
        <ConstructionHero />
        <GameSection onSelectGame={setActiveGame} />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
