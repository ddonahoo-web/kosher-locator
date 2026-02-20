import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Restaurant } from '../schema/restaurant'
import { useAppStore, SORT_LABELS, type SortOption } from '../store/useAppStore'
import { StarRating } from './StarRating'

const ROW_HEIGHT = 180

const SORT_OPTIONS = Object.keys(SORT_LABELS) as SortOption[]

export function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const setSelectedRestaurantId = useAppStore((s) => s.setSelectedRestaurantId)
  const sortBy = useAppStore((s) => s.sortBy)
  const setSortBy = useAppStore((s) => s.setSortBy)

  const virtualizer = useVirtualizer({
    count: restaurants.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  const handleClick = (r: Restaurant) => {
    setSelectedRestaurantId(r.id)
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-lg font-semibold text-gray-700">No restaurants found</p>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto bg-gray-50">
      {/* Sort header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">
          {restaurants.length} result{restaurants.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-500">Sort:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md px-2.5 py-1.5 pr-7 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 6px center',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{SORT_LABELS[opt]}</option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const r = restaurants[virtualRow.index]
          const idx = virtualRow.index + 1
          const cuisineList = Array.isArray(r.cuisine)
            ? r.cuisine
            : r.cuisine
            ? [r.cuisine]
            : []

          return (
            <div
              key={r.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <button
                type="button"
                onClick={() => handleClick(r)}
                className="w-full text-left p-5 flex gap-4 hover:bg-white transition-colors border-b border-gray-200 h-full group"
              >
                {/* Image */}
                <div className="relative shrink-0 w-[130px] h-[130px] rounded-lg overflow-hidden bg-gray-200">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs font-bold text-gray-800 shadow-sm">
                    {idx}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-brand transition-colors truncate">
                    {idx}. {r.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1">
                    {r.rating != null && (
                      <>
                        <StarRating rating={r.rating} size="sm" />
                        <span className="text-sm font-semibold text-gray-700">{r.rating.toFixed(1)}</span>
                      </>
                    )}
                    {r.reviewCount != null && (
                      <span className="text-sm text-gray-500">
                        ({r.reviewCount.toLocaleString()} review{r.reviewCount !== 1 ? 's' : ''})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600">
                    {r.certification && (
                      <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        {r.certification}
                      </span>
                    )}
                    {r.priceLevel && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="font-medium">{r.priceLevel}</span>
                      </>
                    )}
                    {(r.city || r.state) && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{[r.city, r.state].filter(Boolean).join(', ')}</span>
                      </>
                    )}
                  </div>

                  {r.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      "{r.description}"
                    </p>
                  )}

                  {cuisineList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cuisineList.slice(0, 4).map((c) => (
                        <span
                          key={c}
                          className="inline-block px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
