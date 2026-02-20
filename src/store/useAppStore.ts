import type { Restaurant } from '../schema/restaurant'
import { create } from 'zustand'

export type ViewMode = 'map' | 'list'
export type SortOption = 'recommended' | 'rating' | 'reviews' | 'name_az' | 'name_za' | 'price_low' | 'price_high'

export const SORT_LABELS: Record<SortOption, string> = {
  recommended: 'Recommended',
  rating: 'Highest Rated',
  reviews: 'Most Reviewed',
  name_az: 'Name (A–Z)',
  name_za: 'Name (Z–A)',
  price_low: 'Price: Low to High',
  price_high: 'Price: High to Low',
}

const priceLevelToNum: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }

interface AppState {
  restaurants: Restaurant[] | null
  setRestaurants: (r: Restaurant[] | null) => void
  selectedRestaurantId: string | null
  setSelectedRestaurantId: (id: string | null) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  certificationFilter: string
  setCertificationFilter: (c: string) => void
  cuisineFilter: string
  setCuisineFilter: (c: string) => void
  clearFilters: () => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  sortBy: SortOption
  setSortBy: (s: SortOption) => void
}

export const useAppStore = create<AppState>((set) => ({
  restaurants: null,
  setRestaurants: (restaurants) => set({ restaurants }),
  selectedRestaurantId: null,
  setSelectedRestaurantId: (selectedRestaurantId) => set({ selectedRestaurantId }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  certificationFilter: '',
  setCertificationFilter: (certificationFilter) => set({ certificationFilter }),
  cuisineFilter: '',
  setCuisineFilter: (cuisineFilter) => set({ cuisineFilter }),
  clearFilters: () => set({ certificationFilter: '', cuisineFilter: '' }),
  viewMode: 'map',
  setViewMode: (viewMode) => set({ viewMode }),
  sortBy: 'recommended',
  setSortBy: (sortBy) => set({ sortBy }),
}))

function matchesSearch(r: Restaurant, q: string): boolean {
  if (!q.trim()) return true
  const lower = q.toLowerCase().trim()
  const name = (r.name ?? '').toLowerCase()
  const address = (r.address ?? '').toLowerCase()
  const city = (r.city ?? '').toLowerCase()
  const state = (r.state ?? '').toLowerCase()
  return name.includes(lower) || address.includes(lower) || city.includes(lower) || state.includes(lower)
}

function matchesCertification(r: Restaurant, cert: string): boolean {
  if (!cert.trim()) return true
  return (r.certification ?? '').toLowerCase() === cert.toLowerCase().trim()
}

function matchesCuisine(r: Restaurant, cuisine: string): boolean {
  if (!cuisine.trim()) return true
  const c = cuisine.toLowerCase().trim()
  const rCuisine = r.cuisine
  if (typeof rCuisine === 'string') return rCuisine.toLowerCase() === c
  if (Array.isArray(rCuisine)) return rCuisine.some((x) => x.toLowerCase() === c)
  return false
}

function sortRestaurants(list: Restaurant[], sortBy: SortOption): Restaurant[] {
  const sorted = [...list]
  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    case 'reviews':
      return sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    case 'name_az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_za':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'price_low':
      return sorted.sort((a, b) => (priceLevelToNum[a.priceLevel ?? ''] || 99) - (priceLevelToNum[b.priceLevel ?? ''] || 99))
    case 'price_high':
      return sorted.sort((a, b) => (priceLevelToNum[b.priceLevel ?? ''] || 0) - (priceLevelToNum[a.priceLevel ?? ''] || 0))
    case 'recommended':
    default:
      return sorted.sort((a, b) => {
        const scoreA = (a.rating ?? 0) * Math.log10((a.reviewCount ?? 0) + 1)
        const scoreB = (b.rating ?? 0) * Math.log10((b.reviewCount ?? 0) + 1)
        return scoreB - scoreA
      })
  }
}

export function getFilteredRestaurants(state: {
  restaurants: Restaurant[] | null
  searchQuery: string
  certificationFilter: string
  cuisineFilter: string
  sortBy: SortOption
}): Restaurant[] {
  const { restaurants, searchQuery, certificationFilter, cuisineFilter, sortBy } = state
  if (!restaurants?.length) return []
  const filtered = restaurants.filter(
    (r) =>
      matchesSearch(r, searchQuery) &&
      matchesCertification(r, certificationFilter) &&
      matchesCuisine(r, cuisineFilter)
  )
  return sortRestaurants(filtered, sortBy)
}
