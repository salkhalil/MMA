"use client";

interface Props {
  currentRound: number;
  totalRounds: number;
  autoPlay: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleAutoPlay: () => void;
  onSkipToEnd: () => void;
}

export default function RoundControls({
  currentRound,
  totalRounds,
  autoPlay,
  onPrev,
  onNext,
  onToggleAutoPlay,
  onSkipToEnd,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={currentRound === 0}
        className="p-2 rounded-lg transition-all disabled:opacity-30"
        style={{ color: "var(--text-primary)" }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={onToggleAutoPlay}
        disabled={currentRound === totalRounds - 1}
        className="p-3 rounded-full transition-all disabled:opacity-30"
        style={{ background: "var(--gradient-primary)", color: "white" }}
      >
        {autoPlay ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={currentRound === totalRounds - 1}
        className="p-2 rounded-lg transition-all disabled:opacity-30"
        style={{ color: "var(--text-primary)" }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Skip to end */}
      <button
        onClick={onSkipToEnd}
        disabled={currentRound === totalRounds - 1}
        className="px-3 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
        style={{
          backgroundColor: "var(--background-secondary)",
          color: "var(--text-secondary)",
        }}
      >
        Skip
      </button>

      {/* Round dots */}
      <div className="flex items-center gap-1 ml-2">
        {Array.from({ length: totalRounds }, (_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              backgroundColor:
                i === currentRound
                  ? "var(--primary)"
                  : i < currentRound
                  ? "var(--primary-light)"
                  : "var(--text-tertiary)",
              transform: i === currentRound ? "scale(1.5)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
