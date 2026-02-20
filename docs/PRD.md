# KosherEats — Product Requirements Document (PRD)

**Version:** 2.0  
**Last updated:** February 2026  
**Status:** Implemented (v1)

---

## 1. Overview & Product Vision

### 1.1 What We Built

A **single-page web application** that helps users discover and navigate to **kosher restaurants across the United States**. Users interact with an **interactive map**, view **restaurant details** via a slide-in overlay panel, get **directions**, and can **filter**, **search**, and **sort** results. The UI follows a Yelp-inspired design language with an **orange brand theme**.

### 1.2 Goals

- **Discovery:** Find kosher restaurants by location, name, certification, cuisine, rating, or price level.
- **Trust:** Surface kosher certification (e.g., OU, OK, Kof-K, Star-K) clearly on every card and detail view.
- **Action:** One-tap directions (Apple Maps / Google Maps), call, and website access.
- **Accessibility & performance:** Usable on any screen size (desktop, tablet, mobile) with a persistent header, smooth map interaction, and virtualized list scrolling.

### 1.3 Target Users

- Jewish consumers looking for kosher dining options while traveling or locally.
- Tourists and locals who want to filter by certification or cuisine, sort by rating, and get directions quickly.

---

## 2. Tech Stack

All versions are pinned where possible. The codebase is a single Vite + React SPA.

| Layer | Technology | Version (min) | Purpose |
|-------|------------|--------------|---------|
| **Language** | TypeScript | 5.x | Type safety, better IDE support, fewer runtime bugs. |
| **Framework** | React | 18.x | UI components, hooks, ecosystem. |
| **Build / Dev** | Vite | 5.x | Fast dev server, optimized production builds, native ESM. |
| **Routing** | React Router | 6.x | Client-side URL state for search and filter params. |
| **Map** | Leaflet + React-Leaflet | 1.9+ / 4.x | Interactive map, markers, popups; no API key (OSM tiles). |
| **Base map tiles** | OpenStreetMap | — | Free tile layer; swappable to Mapbox later. |
| **Clustering** | react-leaflet-cluster | 2.x | Groups nearby pins for performance and clarity. |
| **State** | Zustand | 4.x | Global state: search, filters, selected restaurant, view mode, sort. |
| **Data validation** | Zod | 3.x | Validates `restaurants.json` shape at load time. |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS, responsive breakpoints, custom brand color palette. |
| **List virtualization** | TanStack Virtual | 3.x | Smooth scrolling for the restaurant list at any length. |
| **Linting / Format** | ESLint | 9.x | Code quality and style. |

### 2.1 Architecture Decisions

- **Single-page, no route-based detail view.** The restaurant detail panel is a state-managed overlay, not a separate route (`/restaurant/:id`). This prevents the map from unmounting and losing its viewport state when a pin is clicked.
- **Stacking context isolation.** The Leaflet map container uses `isolation: isolate` in CSS so Leaflet's internal z-indexes (400+) are contained and never paint above the persistent header.
- **No SSR.** Vite + React keeps the app simple for v1. Migration to Next.js is possible later if SEO is needed.
- **Zustand over Redux.** Lightweight, minimal boilerplate, and sufficient for the filter/search/selection state.

---

## 3. Implemented Features

### 3.1 Interactive US Map with Restaurant Pins

- Renders a Leaflet map centered on the continental US, with OpenStreetMap tiles.
- Displays a **numbered teardrop marker** for each restaurant (up to 50; falls back to default Leaflet icons beyond that).
- **Marker clustering** groups dense pins into orange circular cluster badges.
- On initial load, **fits map bounds** to all restaurant locations.
- Clicking a marker selects the restaurant, triggering `flyTo` zoom animation and opening the detail panel.
- `MapResizeHandler` uses a `ResizeObserver` to call `map.invalidateSize()` when the map container resizes (e.g., mobile view toggle).

### 3.2 Restaurant Detail Overlay

- **Slide-in panel** (right side, 440px on desktop; full-screen on mobile) with a `slideIn` CSS animation.
- **Hero image** with gradient overlay, restaurant name, star rating, and review count.
- Quick-info bar: certification badge, price level.
- Cuisine tags, description, and action buttons.
- Close via close button, Escape key, or backdrop click.
- Focus management: auto-focuses the first interactive element on open.
- **No route change** — the panel is rendered conditionally based on `selectedRestaurantId` in Zustand state.

### 3.3 Directions, Call & Website Actions

- **Google Maps** and **Apple Maps** direction buttons using `lat,lng` coordinates.
- **Call** button via `tel:` link (shown only when phone data exists).
- **Website** button via `target="_blank"` link (shown only when a valid `http(s)` URL exists).
- URL validation: only `http`/`https` URLs are rendered as links.

### 3.4 Data Model & Source

Static JSON file at `public/restaurants.json`, validated at load time with Zod.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier. |
| `name` | string | Yes | Display name. |
| `address` | string | Yes | Full street address. |
| `latitude` | number | Yes | WGS84. |
| `longitude` | number | Yes | WGS84. |
| `phone` | string | No | Display or E.164 format. |
| `website` | string (URL) | No | Must be a valid URL. |
| `hours` | string | No | Human-readable hours. |
| `certification` | string | No | e.g., "OU", "OK", "Kof-K", "Star-K". |
| `cuisine` | string \| string[] | No | e.g., "Dairy", "Pizza", ["Meat", "Grill"]. |
| `description` | string | No | Short blurb. |
| `city` | string | No | City name for search. |
| `state` | string | No | State code (e.g., "NY"). |
| `imageUrl` | string (URL) | No | Hero image URL. |
| `rating` | number (0–5) | No | Average star rating. |
| `reviewCount` | integer (>= 0) | No | Total review count. |
| `priceLevel` | "$" \| "$$" \| "$$$" \| "$$$$" | No | Price tier. |

The dataset currently contains 5 real restaurants in Austin, TX: Jewboy Burgers, The Kosher Store, Franklin Barbecue, Salty Sow, and The Shuk.

### 3.5 Search

- Search input in the **persistent header** with a magnifying glass icon.
- Searches by **name**, **address**, **city**, and **state** (case-insensitive substring match).
- **300ms debounce** on input to avoid filtering on every keystroke.
- Search query synced to URL param `?q=` for shareable/bookmarkable links.
- Displays result count ("X of Y results") in the header on desktop.
- "No results" warning bar when filters/search yield zero matches.

### 3.6 Filters

- **Certification filter chips**: "All Certifications" plus a chip per unique certification found in the data. Active chip uses brand orange; inactive uses a neutral pill style.
- **Cuisine dropdown**: populated from unique cuisines in the dataset.
- **Clear Filters** button appears when any filter is active.
- Filter state synced to URL params (`?cert=`, `?cuisine=`).
- Filters derived from the live dataset so they stay in sync automatically.

### 3.7 Sorting

- **Sort dropdown** in the list header with 7 options:
  - Recommended (weighted score: rating × log10(reviewCount + 1))
  - Highest Rated
  - Most Reviewed
  - Name (A–Z)
  - Name (Z–A)
  - Price: Low to High
  - Price: High to Low
- Sort state managed in Zustand; applies after search + filters.

### 3.8 List View

- Virtualized scrolling via **TanStack Virtual** (estimated row height: 180px, overscan: 5).
- Each card shows: numbered badge, restaurant image (with hover zoom), name, star rating, review count, certification, price level, city/state, description excerpt (2-line clamp), and cuisine tags (up to 4).
- Clicking a card selects the restaurant (same behavior as clicking a map pin).
- Sticky sort header inside the list.

### 3.9 Responsive Layout

**Desktop (lg+ / 1024px and above):**
- **Persistent header** (orange brand bar with logo, search, result count).
- **Filter bar** below the header (certification chips, cuisine dropdown).
- **Split layout**: fixed-width list sidebar (480px) on the left, flexible map fills the remaining space on the right. Both are always visible.
- Map/List toggle is hidden on desktop.
- Detail panel overlays the right side (440px) over the map area.

**Mobile (< 1024px):**
- Header and filter bar remain visible.
- **Map/List toggle** in the filter bar switches between full-width map and full-width list.
- Detail panel opens full-screen.
- Filter bar supports horizontal scroll for overflow.

### 3.10 Z-Index & Stacking Architecture

The app uses a deliberate stacking context hierarchy to prevent the map from overlapping the header during drag/pan:

```
Root stacking context:
  Header ............. z-[100]  (always on top)
  Filter bar ......... z-[90]   (below header, above content)
  Main content area .. isolate  (own stacking context, z-auto)
    └── Detail panel . z-[60]   (above map within main)
    └── Backdrop ..... z-[50]   (above map within main)
    └── Map .......... isolate  (Leaflet z-400+ contained here)
    └── List ......... z-auto
```

Key CSS: `.leaflet-container { isolation: isolate; }` contains all Leaflet internal z-indexes so they never escape the map area.

---

## 4. UI & Design

### 4.1 Brand Theme

- **Primary color:** Orange `#f97316` (Tailwind `brand`)
- **Hover/dark:** `#ea580c` (`brand-dark`)
- **Light accent:** `#fb923c` (`brand-light`)
- **Star ratings:** Orange fill (`#f97316`)
- **Map markers:** Orange teardrop pins with white text numbers
- **Cluster badges:** Orange circles with white count text
- **Font:** Helvetica Neue, Helvetica, Arial, sans-serif
- **Branding:** "KosherEats" wordmark in the header

### 4.2 Component Inventory

| Component | File | Purpose |
|-----------|------|---------|
| `Header` | `src/components/Header.tsx` | Persistent top bar: logo, search input, result count. |
| `FilterPanel` | `src/components/FilterPanel.tsx` | Certification chips, cuisine dropdown, map/list toggle (mobile). |
| `RestaurantList` | `src/components/RestaurantList.tsx` | Virtualized list with sort header and restaurant cards. |
| `RestaurantMap` | `src/components/RestaurantMap.tsx` | Leaflet map with numbered markers, clusters, flyTo, and resize handler. |
| `RestaurantDetail` | `src/components/RestaurantDetail.tsx` | Slide-in overlay panel with full restaurant info and actions. |
| `StarRating` | `src/components/StarRating.tsx` | SVG star rating (full, half, empty) in sm/md/lg sizes. |

### 4.3 State Management (Zustand Store)

| State | Type | Purpose |
|-------|------|---------|
| `restaurants` | `Restaurant[] \| null` | Full dataset loaded from JSON. |
| `selectedRestaurantId` | `string \| null` | Currently selected restaurant (drives detail panel + flyTo). |
| `searchQuery` | `string` | Current search input. |
| `certificationFilter` | `string` | Active certification filter. |
| `cuisineFilter` | `string` | Active cuisine filter. |
| `viewMode` | `'map' \| 'list'` | Mobile toggle state. |
| `sortBy` | `SortOption` | Active sort option (7 values). |

Derived state: `getFilteredRestaurants()` applies search → certification → cuisine → sort.

---

## 5. File Structure

```
public/
  restaurants.json          # Static restaurant dataset (5 Austin entries)
src/
  App.tsx                   # Root layout, data loading, error/loading states
  index.css                 # Global styles, Tailwind directives, Leaflet overrides
  main.tsx                  # React entry point
  schema/
    restaurant.ts           # Zod schema + TypeScript types
  store/
    useAppStore.ts          # Zustand store, filter/sort logic
  components/
    Header.tsx
    FilterPanel.tsx
    RestaurantList.tsx
    RestaurantMap.tsx
    RestaurantDetail.tsx
    StarRating.tsx
index.html                  # HTML shell
vite.config.ts
tailwind.config.js          # Custom brand color palette
tsconfig.json
package.json
```

---

## 6. URL & Data Conventions

### 6.1 URL Query Params

| Param | Example | Purpose |
|-------|---------|---------|
| `q` | `?q=pizza` | Search query |
| `cert` | `?cert=OU` | Certification filter |
| `cuisine` | `?cuisine=Pizza` | Cuisine filter |

### 6.2 Directions URL Formats

- **Apple Maps:** `https://maps.apple.com/?daddr=<lat>,<lng>`
- **Google Maps:** `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`

---

## 7. Acceptance Criteria (v1 — all met)

- [x] Map loads with OSM tiles and shows numbered pins for all restaurants.
- [x] Marker clustering groups nearby pins with count badges.
- [x] Clicking a pin flies the map to the restaurant and opens the detail overlay.
- [x] Clicking a list card does the same (fly + detail).
- [x] Detail panel shows name, image, rating, reviews, certification, price, cuisine, description, address, hours, phone, website.
- [x] "Google Maps" and "Apple Maps" direction buttons open the correct URL.
- [x] "Call" and "Website" buttons work when data exists.
- [x] Search filters by name, city, address, state with 300ms debounce.
- [x] Certification chip filters narrow results; cuisine dropdown filters narrow results.
- [x] Sort dropdown sorts by recommended, rating, reviews, name (A–Z/Z–A), price (low/high).
- [x] Desktop: persistent header + filter bar + split list/map layout.
- [x] Mobile: map/list toggle works; detail opens full-screen.
- [x] Header never covered by map during drag/pan (stacking context isolation).
- [x] Layout scales for any screen size.
- [x] Data validated with Zod at load time.
- [x] List uses virtualized scrolling.

---

## 8. Future Enhancements (v2+)

| Feature | Notes |
|---------|-------|
| **Favorites / saved restaurants** | Heart icon, `localStorage` persistence, "Favorites" filter. |
| **Geolocation ("Near Me")** | Browser Geolocation API, sort by distance, "you are here" marker. |
| **Fuzzy search (Fuse.js)** | Typo-tolerant search. |
| **"Open Now" filter** | Requires parseable hours data + timezone-aware logic. |
| **Backend API** | Replace static JSON with a REST/GraphQL API for dynamic data. |
| **User reviews & ratings** | User-submitted reviews, authentication. |
| **Custom map styling** | Mapbox GL JS for branded map tiles. |
| **Restaurant submission form** | Allow users or owners to submit new restaurants. |
| **PWA support** | Offline caching, installable. |

---

*End of PRD.*
