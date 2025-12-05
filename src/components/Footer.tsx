import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Instagram Link */}
          <a
            href="https://instagram.com/shakir_r5"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 glass-card px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow"
          >
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-2.5 rounded-xl transition-transform duration-300 group-hover:rotate-12">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Follow me on Instagram</p>
              <p className="font-display font-semibold text-foreground">@shakir_r5</p>
            </div>
          </a>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />

          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center">
            Made with 💖 • More awesome stuff coming soon!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
