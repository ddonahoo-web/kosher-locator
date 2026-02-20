import { useEffect, useRef } from 'react'
import type { Restaurant } from '../schema/restaurant'
import { useAppStore } from '../store/useAppStore'
import { StarRating } from './StarRating'

const APPLE_MAPS = 'https://maps.apple.com/?daddr='
const GOOGLE_MAPS = 'https://www.google.com/maps/dir/?api=1&destination='

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s)
}

export function RestaurantDetail({ restaurant }: { restaurant: Restaurant | null }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const setSelectedRestaurantId = useAppStore((s) => s.setSelectedRestaurantId)

  const close = () => {
    setSelectedRestaurantId(null)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!restaurant || !panelRef.current) return
    const focusable = panelRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  }, [restaurant])

  if (!restaurant) return null

  const dest = `${restaurant.latitude},${restaurant.longitude}`
  const cuisineList = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
    : restaurant.cuisine
    ? [restaurant.cuisine]
    : []

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-[50] bg-black/30 lg:bg-black/10 lg:pointer-events-none"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel — fills parent height, slides in from right on desktop */}
      <div
        ref={panelRef}
        role="dialog"
        aria-labelledby="detail-title"
        aria-modal="true"
        className="absolute inset-0 z-[60] flex flex-col bg-white lg:left-auto lg:w-[440px] shadow-2xl overflow-hidden"
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        {/* Hero image */}
        {restaurant.imageUrl && isHttpUrl(restaurant.imageUrl) ? (
          <div className="relative h-52 shrink-0">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 rounded-full bg-black/40 hover:bg-black/60 p-2 text-white transition-colors backdrop-blur-sm"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <div className="absolute bottom-4 left-5 right-5">
              <h2 id="detail-title" className="text-2xl font-bold text-white drop-shadow-lg">
                {restaurant.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                {restaurant.rating != null && (
                  <StarRating rating={restaurant.rating} size="md" />
                )}
                {restaurant.rating != null && (
                  <span className="text-white font-semibold text-sm drop-shadow">
                    {restaurant.rating.toFixed(1)}
                  </span>
                )}
                {restaurant.reviewCount != null && (
                  <span className="text-white/80 text-sm drop-shadow">
                    ({restaurant.reviewCount.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 shrink-0">
            <div>
              <h2 id="detail-title" className="text-xl font-bold text-gray-900">
                {restaurant.name}
              </h2>
              {restaurant.rating != null && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={restaurant.rating} size="sm" />
                  <span className="text-sm font-semibold text-gray-700">{restaurant.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick info bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
            {restaurant.certification && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {restaurant.certification} Certified
              </span>
            )}
            {restaurant.priceLevel && (
              <span className="text-sm font-semibold text-gray-700">{restaurant.priceLevel}</span>
            )}
          </div>

          {/* Cuisine tags */}
          {cuisineList.length > 0 && (
            <div className="flex flex-wrap gap-2 px-5 pt-4">
              {cuisineList.map((c) => (
                <span
                  key={c}
                  className="inline-block px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {restaurant.description && (
            <div className="px-5 pt-4">
              <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5 px-5 pt-5">
            <a
              href={`${GOOGLE_MAPS}${encodeURIComponent(dest)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold py-3 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Google Maps
            </a>
            <a
              href={`${APPLE_MAPS}${encodeURIComponent(dest)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Apple Maps
            </a>
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-800 font-semibold py-3 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Call
              </a>
            )}
            {restaurant.website && isHttpUrl(restaurant.website) && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-800 font-semibold py-3 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Website
              </a>
            )}
          </div>

          {/* Info sections */}
          <div className="px-5 pt-5 pb-8 space-y-4">
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Location & Hours</h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-sm text-gray-700">
                  <svg className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>{restaurant.address}</span>
                </div>
                {restaurant.hours && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <svg className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{restaurant.hours}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <svg className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.website && isHttpUrl(restaurant.website) && (
                  <div className="flex items-start gap-2.5 text-sm">
                    <svg className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      {restaurant.website.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
