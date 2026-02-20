import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { restaurantsArraySchema } from './schema/restaurant'
import { useAppStore, getFilteredRestaurants } from './store/useAppStore'
import { Header } from './components/Header'
import { FilterPanel } from './components/FilterPanel'
import { RestaurantMap } from './components/RestaurantMap'
import { RestaurantList } from './components/RestaurantList'
import { RestaurantDetail } from './components/RestaurantDetail'

function MainContent() {
  const restaurants = useAppStore((s) => s.restaurants)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const certificationFilter = useAppStore((s) => s.certificationFilter)
  const cuisineFilter = useAppStore((s) => s.cuisineFilter)
  const sortBy = useAppStore((s) => s.sortBy)
  const viewMode = useAppStore((s) => s.viewMode)
  const selectedRestaurantId = useAppStore((s) => s.selectedRestaurantId)

  const filtered = getFilteredRestaurants({
    restaurants,
    searchQuery,
    certificationFilter,
    cuisineFilter,
    sortBy,
  })

  const selectedRestaurant = selectedRestaurantId
    ? (restaurants ?? []).find((r) => r.id === selectedRestaurantId) ?? null
    : null

  const hasNoResults = filtered.length === 0 && (restaurants?.length ?? 0) > 0

  return (
    <>
      <FilterPanel restaurants={restaurants ?? []} />

      {hasNoResults && (
        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          No results found. Try broadening your search or clearing filters.
        </div>
      )}

      {/*
        Main content area: creates its own stacking context via `isolate`
        so nothing inside here can ever paint above the header.
      */}
      <div className="flex-1 flex min-h-0 isolate relative">
        {/* List panel */}
        <div
          className={`flex flex-col bg-white border-r border-gray-200 ${
            viewMode === 'map'
              ? 'hidden lg:flex lg:w-[480px] lg:shrink-0'
              : 'flex-1 lg:w-[480px] lg:shrink-0 lg:flex-none'
          }`}
        >
          <RestaurantList restaurants={filtered} />
        </div>

        {/* Map panel — isolated overflow-hidden keeps Leaflet contained */}
        <div
          className={`flex flex-col overflow-hidden ${
            viewMode === 'map'
              ? 'flex-1'
              : 'hidden lg:flex lg:flex-1'
          }`}
        >
          <RestaurantMap restaurants={filtered} />
        </div>

        {/* Detail overlay — z-[50] is above map (z-auto) within this stacking context */}
        {selectedRestaurant && (
          <RestaurantDetail restaurant={selectedRestaurant} />
        )}
      </div>
    </>
  )
}

export default function App() {
  const setRestaurants = useAppStore((s) => s.setRestaurants)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/restaurants.json')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const raw = await res.json()
        const parsed = restaurantsArraySchema.safeParse(raw)
        if (!parsed.success) {
          console.error('Validation failed:', parsed.error.flatten())
          if (!cancelled) setError(true)
          return
        }
        if (!cancelled) setRestaurants(parsed.data)
      } catch (e) {
        console.error('Failed to load restaurants:', e)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [setRestaurants])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading restaurants...</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <p role="alert" className="text-red-600 font-semibold">
            Failed to load restaurant data.
          </p>
          <p className="text-gray-500 text-sm mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <Header />
        <MainContent />
      </div>
    </BrowserRouter>
  )
}
