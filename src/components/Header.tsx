import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppStore, getFilteredRestaurants } from '../store/useAppStore'

const DEBOUNCE_MS = 300

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams()
  const restaurants = useAppStore((s) => s.restaurants)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const certificationFilter = useAppStore((s) => s.certificationFilter)
  const cuisineFilter = useAppStore((s) => s.cuisineFilter)
  const sortBy = useAppStore((s) => s.sortBy)

  const filteredCount = useMemo(
    () =>
      getFilteredRestaurants({
        restaurants,
        searchQuery,
        certificationFilter,
        cuisineFilter,
        sortBy,
      }).length,
    [restaurants, searchQuery, certificationFilter, cuisineFilter, sortBy]
  )
  const totalCount = restaurants?.length ?? 0

  const [localQuery, setLocalQuery] = useState(searchQuery)

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setSearchQuery(q)
    setLocalQuery(q)
  }, [searchParams, setSearchQuery])

  useEffect(() => {
    const cert = searchParams.get('cert') ?? ''
    const cuisine = searchParams.get('cuisine') ?? ''
    useAppStore.setState({ certificationFilter: cert, cuisineFilter: cuisine })
  }, [searchParams])

  const debouncedSetQuery = useCallback(() => {
    setSearchQuery(localQuery)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (localQuery.trim()) next.set('q', localQuery.trim())
      else next.delete('q')
      return next
    }, { replace: true })
  }, [localQuery, setSearchParams, setSearchQuery])

  useEffect(() => {
    const t = setTimeout(debouncedSetQuery, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [localQuery, debouncedSetQuery])

  const syncFiltersToUrl = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (certificationFilter) next.set('cert', certificationFilter)
      else next.delete('cert')
      if (cuisineFilter) next.set('cuisine', cuisineFilter)
      else next.delete('cuisine')
      return next
    }, { replace: true })
  }, [certificationFilter, cuisineFilter, setSearchParams])

  useEffect(() => {
    syncFiltersToUrl()
  }, [certificationFilter, cuisineFilter, syncFiltersToUrl])

  return (
    <header className="shrink-0 relative z-[100] bg-brand shadow-md">
      <div className="mx-auto flex max-w-[1920px] items-center gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-white font-extrabold text-xl tracking-tight hidden sm:inline">
            KosherEats
          </span>
        </a>

        <div className="flex flex-1 items-center">
          <div className="relative flex flex-1 max-w-2xl">
            <div className="flex flex-1 items-center rounded-md bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 flex-1 px-3">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search"
                  type="search"
                  placeholder="Kosher restaurants, cuisine, city..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="w-full py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none"
                  aria-label="Search by name, city, or address"
                />
              </div>
              <button
                type="button"
                onClick={debouncedSetQuery}
                className="bg-brand hover:bg-brand-dark px-4 py-2.5 transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center text-white/80 text-sm shrink-0">
          <span className="font-semibold text-white">{filteredCount}</span>
          <span className="ml-1">of {totalCount} results</span>
        </div>
      </div>
    </header>
  )
}
