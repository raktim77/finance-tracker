import { Zap, Sparkles } from "lucide-react";

/**
 * AI Analytics Insights - Mobile Optimized Roadmap State
 */
export function AnalyticsInsights() {
  return (
    <div className="lg:col-span-6 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[200px] md:min-h-[240px] flex flex-col justify-center transition-all">
      
      {/* Background Accents - Scaled down for mobile */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 md:w-64 md:h-64 bg-[var(--color-accent)] opacity-[0.08] blur-3xl rounded-full" />
      <div className="absolute -top-12 -left-12 w-32 h-32 md:w-48 md:h-48 bg-[var(--color-primary)] opacity-[0.05] blur-3xl rounded-full" />

      {/* Header */}
      <div className="relative z-10 mb-6  opacity-80 grayscale flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]">
              <Zap size={16} className="md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h3 className="font-black text-sm md:text-lg text-[var(--color-text-primary)] tracking-tight leading-none mb-1">
                  AI Insights
              </h3>
              <p className="text-[8px] md:text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">
                  Automated Strategy
              </p>
            </div>
        </div>
        
        <div className="px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--color-background)] shrink-0">
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                v2.0 Update
            </span>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="relative z-20 flex flex-col items-center justify-center py-2 md:py-4">
        <div className="group relative w-full flex flex-col items-center">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-10 blur-2xl animate-[shimmer_3s_infinite] pointer-events-none" />
            
            <div className="relative flex flex-col items-center gap-4 md:gap-5 w-full">
                {/* Icon - Scaled for Mobile */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[1.5rem] bg-[var(--color-surface)] border border-[var(--border)] shadow-xl flex items-center justify-center text-[var(--color-accent)] transition-all duration-700 group-hover:rotate-[10deg] group-hover:scale-110">
                    <Sparkles size={20} className="md:w-6 md:h-6" strokeWidth={2} />
                </div>
                
                <div className="flex flex-col items-center text-center gap-2 px-2">
                    <div className="flex items-center gap-2">
                        <div className="h-[1px] w-3 md:w-4 bg-[var(--color-accent)] opacity-20" />
                        <h4 className="text-[12px] md:text-[14px] font-black text-[var(--color-text-primary)] uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">
                            Coming in Next Release
                        </h4>
                        <div className="h-[1px] w-3 md:w-4 bg-[var(--color-accent)] opacity-20" />
                    </div>
                    
                    <p className="text-[10px] md:text-[12px] font-bold text-[var(--color-text-secondary)] opacity-60 max-w-[240px] md:max-w-[280px] leading-relaxed italic">
                        "Fine-tuning the predictive engine for personalized spending optimizations and smart alerts."
                    </p>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}