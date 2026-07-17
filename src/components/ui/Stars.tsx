interface StarsProps {
  value: number;
  size?: number;
  /** Called with the clicked star (1–5); renders as an input when set. */
  onSelect?: (rating: number) => void;
}

export default function Stars({ value, size = 15, onSelect }: StarsProps) {
  return (
    <div
      className="flex gap-0.5"
      role={onSelect ? "radiogroup" : undefined}
      aria-label={onSelect ? "Choose a rating" : `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const svg = (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden
            fill={filled ? "#95714f" : "none"}
            stroke="#95714f"
            strokeWidth="1.5"
          >
            <path d="M12 2.5 L14.9 8.6 L21.5 9.5 L16.7 14.1 L17.9 20.7 L12 17.5 L6.1 20.7 L7.3 14.1 L2.5 9.5 L9.1 8.6 Z" />
          </svg>
        );
        return onSelect ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === Math.round(value)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onSelect(star)}
            className="transition-transform duration-150 hover:scale-125"
          >
            {svg}
          </button>
        ) : (
          <span key={star}>{svg}</span>
        );
      })}
    </div>
  );
}
