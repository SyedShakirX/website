import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface GameCardProps {
  title: string;
  icon: ReactNode;
  gradient: string;
  onClick?: () => void;
  isComingSoon?: boolean;
  delay?: number;
}

const GameCard = ({ title, icon, gradient, onClick, isComingSoon = false, delay = 0 }: GameCardProps) => {
  return (
    <div
      className={`game-card opacity-0 animate-scale-in ${isComingSoon ? 'cursor-default' : ''}`}
      style={{
        background: gradient,
        animationDelay: `${delay}s`,
        animationFillMode: 'forwards',
      }}
      onClick={isComingSoon ? undefined : onClick}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {/* Icon container */}
        <div className="relative">
          <div className="bg-card/30 backdrop-blur-sm p-5 rounded-2xl shadow-soft">
            {icon}
          </div>
          {isComingSoon && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-xl text-foreground/90">
          {title}
        </h3>

        {/* Play button or coming soon */}
        {isComingSoon ? (
          <span className="text-sm font-medium text-muted-foreground bg-card/50 px-4 py-2 rounded-full">
            Coming Soon
          </span>
        ) : (
          <span className="text-sm font-semibold text-primary-foreground bg-primary/80 px-6 py-2 rounded-full shadow-md transition-all duration-300 group-hover:bg-primary group-hover:shadow-lg">
            Play Now
          </span>
        )}
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-card/10 rounded-bl-[100px]" />
    </div>
  );
};

export default GameCard;
