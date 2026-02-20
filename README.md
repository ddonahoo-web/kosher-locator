# KosherEats

A Yelp-inspired web application for discovering kosher restaurants across the United States. Built with React, TypeScript, Leaflet, and Tailwind CSS.

![Status](https://img.shields.io/badge/status-v1%20complete-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone <repo-url>
cd WebAppProject
npm install
```

### Running Locally

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## Features

### Interactive Map
- Full US map powered by **Leaflet + OpenStreetMap** (no API key required).
- **Numbered orange teardrop markers** for each restaurant (up to 50 visible).
- **Marker clustering** groups nearby pins into count badges when zoomed out.
- **Fly-to animation** smoothly zooms the map to a restaurant's location when its pin or list card is clicked.
- Map auto-fits bounds to all restaurants on initial load.

### Restaurant Detail Panel
- **Slide-in overlay** (440px on desktop, full-screen on mobile) with smooth animation.
- Hero image with gradient overlay, restaurant name, star rating, and review count.
- Certification badge, price level, cuisine tags, and description.
- **One-tap actions:** Google Maps directions, Apple Maps directions, Call, and Website.
- Closes via close button, Escape key, or backdrop click.

### Search
- Live search in the persistent header bar.
- Filters by **name**, **address**, **city**, and **state** (case-insensitive).
- **300ms debounce** for smooth typing without lag.
- Search query synced to URL (`?q=`) for shareable links.

### Filters
- **Certification chips** (OU, OK, Kof-K, Star-K, etc.) — one-click toggle.
- **Cuisine dropdown** populated dynamically from the dataset.
- **Clear Filters** button when any filter is active.
- Filter state synced to URL params (`?cert=`, `?cuisine=`).

### Sorting
- 7 sort options: Recommended, Highest Rated, Most Reviewed, Name (A-Z), Name (Z-A), Price Low-to-High, Price High-to-Low.
- "Recommended" uses a weighted score: `rating x log10(reviewCount + 1)`.

### Restaurant List
- **Virtualized scrolling** via TanStack Virtual for smooth performance at any list size.
- Cards show: image, numbered badge, name, star rating, review count, certification, price level, city/state, description excerpt, and cuisine tags.

### Responsive Design
- **Desktop (1024px+):** Persistent header + filter bar + split layout (480px list sidebar + flexible map). Both always visible.
- **Mobile (<1024px):** Map/List toggle switches between full-width views. Detail panel opens full-screen.
- **Persistent header** that never gets covered by the map, even during drag/pan.

### Data Validation
- Restaurant data validated at load time with **Zod** schemas.
- Graceful error and loading states with visual feedback.

---

## Known Bugs

- No known bugs at this time. Previously fixed:
  - ~~Clicking a map pin navigated to a new route, causing the map to reset its viewport (appeared to "fly to Iceland").~~ Resolved by switching to a state-managed overlay instead of route-based navigation.
  - ~~Map tiles painted over the header during drag/pan.~~ Resolved via CSS `isolation: isolate` on the Leaflet container to contain its z-indexes.
  - ~~Map/List toggle buttons were non-functional.~~ Resolved with proper conditional rendering and `ResizeObserver`-based map invalidation.

---

## Features To Implement

| Feature | Description | Priority |
|---------|-------------|----------|
| **Favorites** | Save restaurants with a heart icon; persist to `localStorage`; add a "Favorites" filter. | High |
| **Geolocation ("Near Me")** | Use the browser Geolocation API to center the map on the user and sort by distance. | High |
| **Fuzzy Search** | Integrate Fuse.js for typo-tolerant search (e.g., "Teanek" matches "Teaneck"). | Medium |
| **"Open Now" Filter** | Parse hours data with timezone awareness to show only currently open restaurants. | Medium |
| **Backend API** | Replace the static `restaurants.json` with a REST or GraphQL API for dynamic, real-time data. | Medium |
| **User Reviews & Ratings** | Allow users to submit reviews and ratings; requires authentication. | Low |
| **Custom Map Styling** | Swap OSM tiles for Mapbox GL JS to apply branded/custom map styling. | Low |
| **Restaurant Submission Form** | Let restaurant owners submit new listings for review. | Low |
| **PWA Support** | Add a service worker for offline caching and make the app installable. | Low |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Language | **TypeScript 5** | Type safety across the codebase. |
| Framework | **React 18** | Component-based UI with hooks. |
| Build | **Vite 5** | Fast HMR dev server, optimized production builds. |
| Routing | **React Router 6** | URL state for search and filter params. |
| Map | **Leaflet + React-Leaflet** | Interactive map with markers and popups. |
| Clustering | **react-leaflet-cluster** | Groups dense markers for readability. |
| State | **Zustand 4** | Lightweight global state management. |
| Validation | **Zod 3** | Runtime data validation with TypeScript inference. |
| Styling | **Tailwind CSS 3** | Utility-first CSS with custom brand palette. |
| Virtualization | **TanStack Virtual 3** | Renders only visible list rows for performance. |
| Linting | **ESLint 9** | Code quality enforcement. |

---

## Project Structure

```
public/
  restaurants.json            # Static restaurant dataset (5 Austin entries)
src/
  App.tsx                     # Root layout, data loading, error/loading states
  index.css                   # Global styles, Tailwind directives, Leaflet overrides
  main.tsx                    # React entry point
  schema/
    restaurant.ts             # Zod schema + TypeScript types
  store/
    useAppStore.ts            # Zustand store, filter/sort/search logic
  components/
    Header.tsx                # Persistent top bar: logo, search, result count
    FilterPanel.tsx           # Certification chips, cuisine dropdown, map/list toggle
    RestaurantList.tsx        # Virtualized list with sort header and restaurant cards
    RestaurantMap.tsx         # Leaflet map with markers, clusters, flyTo, resize handler
    RestaurantDetail.tsx      # Slide-in overlay panel with full restaurant info
    StarRating.tsx            # SVG star rating component (full, half, empty stars)
index.html
vite.config.ts
tailwind.config.js            # Custom orange brand color palette
tsconfig.json
package.json
```

---

## Data Model

Each restaurant in `public/restaurants.json` follows this schema (validated by Zod):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | Display name |
| `address` | string | Yes | Full street address |
| `latitude` | number | Yes | WGS84 latitude |
| `longitude` | number | Yes | WGS84 longitude |
| `phone` | string | No | Phone number |
| `website` | string (URL) | No | Restaurant website |
| `hours` | string | No | Human-readable hours |
| `certification` | string | No | Kosher certification (OU, OK, Kof-K, Star-K) |
| `cuisine` | string or string[] | No | Cuisine type(s) |
| `description` | string | No | Short description |
| `city` | string | No | City name |
| `state` | string | No | State code |
| `imageUrl` | string (URL) | No | Hero image |
| `rating` | number (0–5) | No | Star rating |
| `reviewCount` | integer | No | Number of reviews |
| `priceLevel` | $ / $$ / $$$ / $$$$ | No | Price tier |

---

## Architecture Notes

**State-managed overlay (not route-based):** The detail panel is toggled via Zustand state rather than navigating to `/restaurant/:id`. This prevents the Leaflet map from unmounting and losing its viewport, which previously caused a bug where the map would reset to its default center.

**Z-index containment:** Leaflet creates internal elements with z-indexes in the 400–700 range. Without containment, these escape their container and paint above the header. The fix uses `isolation: isolate` on the Leaflet container and the main content area, creating stacking contexts that keep the header permanently on top.

**Virtualized list:** TanStack Virtual renders only the visible rows plus a small overscan buffer, keeping DOM size small and scroll performance smooth regardless of dataset size.

---

## License

This project was created for academic purposes.
