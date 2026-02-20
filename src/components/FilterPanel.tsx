import { useMemo } from 'react'
import type { Restaurant } from '../schema/restaurant'
import { useAppStore } from '../store/useAppStore'

export function FilterPanel({
  restaurants,
}: {
  restaurants: Restaurant[]
}) {
  const certificationFilter = useAppStore((s) => s.certificationFilter)
  const setCertificationFilter = useAppStore((s) => s.setCertificationFilter)
  const cuisineFilter = useAppStore((s) => s.cuisineFilter)
  const setCuisineFilter = useAppStore((s) => s.setCuisineFilter)
  const clearFilters = useAppStore((s) => s.clearFilters)
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)

  const certifications = useMemo(() => {
    const set = new Set<string>()
    restaurants.forEach((r) => {
      if (r.certification) set.add(r.certification)
    })
    return Array.from(set).sort()
  }, [restaurants])

  const cuisines = useMemo(() => {
    const set = new Set<string>()
    restaurants.forEach((r) => {
      if (typeof r.cuisine === 'string') set.add(r.cuisine)
      if (Array.isArray(r.cuisine)) r.cuisine.forEach((c) => set.add(c))
    })
    return Array.from(set).sort()
  }, [restaurants])

  const hasActiveFilters = certificationFilter || cuisineFilter

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-200 overflow-x-auto shrink-0 relative z-[90]">
      {/* View toggle — mobile only, on desktop both panels are always visible */}
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden shrink-0 lg:hidden">
        <button
          type="button"
          onClick={() => setViewMode('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'map'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          aria-pressed={viewMode === 'map'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          Map
        </button>
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          aria-pressed={viewMode === 'list'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          List
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200 shrink-0 lg:hidden" />

      {/* Certification filter chips */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setCertificationFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
            !certificationFilter
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Certifications
        </button>
        {certifications.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCertificationFilter(certificationFilter === c ? '' : c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              certificationFilter === c
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 shrink-0" />

      {/* Cuisine dropdown */}
      <select
        value={cuisineFilter}
        onChange={(e) => setCuisineFilter(e.target.value)}
        className="px-3 py-1.5 rounded-full text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer shrink-0 appearance-none pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
      >
        <option value="">All Cuisines</option>
        {cuisines.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <>
          <div className="w-px h-6 bg-gray-200 shrink-0" />
          <button
            type="button"
            onClick={() => clearFilters()}
            className="px-3 py-1.5 rounded-full text-sm font-medium text-brand border border-brand hover:bg-green-50 transition-colors whitespace-nowrap shrink-0"
          >
            Clear Filters
          </button>
        </>
      )}
    </div>
  )
}
