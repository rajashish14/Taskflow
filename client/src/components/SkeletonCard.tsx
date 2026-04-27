// one shimmer animation shared across all skeleton elements
const shimmer = {
  background: "linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.6s infinite",
}

export function SkeletonCard() {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-4"
      style={{ background: "rgba(18,26,37,0.85)", border: "1px solid var(--border)" }}
    >
      <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full" style={shimmer} />
      <div className="flex-1 space-y-2.5">
        <div className="h-3.5 rounded" style={{ ...shimmer, width: "74%" }} />
        <div className="h-3 rounded" style={{ ...shimmer, width: "40%" }} />
        <div className="flex gap-2 pt-1">
          <div className="h-4 w-12 rounded-full" style={shimmer} />
          <div className="h-4 w-16 rounded-full" style={shimmer} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
