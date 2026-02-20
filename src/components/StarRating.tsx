interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4.5 h-4.5',
  lg: 'w-5 h-5',
}

export function StarRating({ rating, size = 'md' }: StarRatingProps) {
  const stars = []
  const rounded = Math.round(rating * 2) / 2

  for (let i = 1; i <= 5; i++) {
    const fill =
      i <= rounded ? 'full' : i - 0.5 <= rounded ? 'half' : 'empty'
    stars.push(
      <svg
        key={i}
        className={sizeMap[size]}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`half-${i}-${rating}`}>
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={
            fill === 'full'
              ? '#f97316'
              : fill === 'half'
              ? `url(#half-${i}-${rating})`
              : '#e5e7eb'
          }
        />
      </svg>
    )
  }

  return (
    <div className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {stars}
    </div>
  )
}
