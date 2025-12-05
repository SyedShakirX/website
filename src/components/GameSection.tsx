import { Gamepad2, Square, Grid3X3, Hash, Sparkles } from "lucide-react";
import GameCard from "./GameCard";

type GameType = "tetris" | "snake" | "2048" | "sudoku" | null;

interface GameSectionProps {
  onSelectGame: (game: GameType) => void;
}

const GameSection = ({ onSelectGame }: GameSectionProps) => {
  const games = [
    {
      id: "tetris" as GameType,
      title: "Tetris",
      icon: <Square className="w-10 h-10 text-coral" />,
      gradient: "linear-gradient(135deg, hsl(15 90% 75%) 0%, hsl(45 100% 75%) 100%)",
    },
    {
      id: "snake" as GameType,
      title: "Snake",
      icon: <Gamepad2 className="w-10 h-10 text-mint" />,
      gradient: "linear-gradient(135deg, hsl(165 60% 75%) 0%, hsl(200 80% 75%) 100%)",
    },
    {
      id: "2048" as GameType,
      title: "2048",
      icon: <Grid3X3 className="w-10 h-10 text-lavender" />,
      gradient: "linear-gradient(135deg, hsl(280 70% 80%) 0%, hsl(15 90% 75%) 100%)",
    },
    {
      id: "sudoku" as GameType,
      title: "Sudoku",
      icon: <Hash className="w-10 h-10 text-sunny" />,
      gradient: "linear-gradient(135deg, hsl(45 100% 75%) 0%, hsl(165 60% 75%) 100%)",
    },
    {
      id: null,
      title: "More Coming Soon",
      icon: <Sparkles className="w-10 h-10 text-muted-foreground" />,
      gradient: "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--border)) 100%)",
      isComingSoon: true,
    },
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Pick Your Game
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose from our collection of classic games and have some fun while you wait!
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {games.map((game, index) => (
            <GameCard
              key={game.id || "coming-soon"}
              title={game.title}
              icon={game.icon}
              gradient={game.gradient}
              onClick={() => game.id && onSelectGame(game.id)}
              isComingSoon={game.isComingSoon}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameSection;
