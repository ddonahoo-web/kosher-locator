# Kosher Restaurant Locator — Product Requirements Document (PRD)

**Version:** 1.0  
**Last updated:** February 2025  
**Status:** Draft for implementation

---

## 1. Overview & Product Vision

### 1.1 What We’re Building

A **web application** that helps users discover and navigate to **kosher restaurants across the United States**. Users interact with an **interactive map**, view **restaurant details**, get **directions**, and can **filter**, **search**, and **save favorites**.

### 1.2 Goals

- **Discovery:** Make it easy to find kosher restaurants by location, name, certification, and cuisine.
- **Trust:** Surface kosher certification (e.g., OU, OK, Kof-K) clearly.
- **Action:** One-tap directions, call, and website from the app.
- **Accessibility & performance:** Usable on desktop and mobile, with fast load and smooth interaction.

### 1.3 Target Users

- Jewish consumers looking for kosher dining options while traveling or locally.
- Tourists and locals who want to filter by certification or cuisine and get directions quickly.

---

## 2. Tech Stack (Specific)

We use a **single tech stack** so the codebase stays consistent and maintainable. All versions are pinned where possible.

| Layer | Technology | Version (min) | Purpose |
|-------|------------|--------------|---------|
| **Language** | TypeScript | 5.x | Type safety, better IDE support, fewer runtime bugs. |
| **Framework** | React | 18.x | UI components, hooks, ecosystem. |
| **Build / Dev** | Vite | 5.x | Fast dev server, optimized production builds, native ESM. |
| **Routing** | React Router | 6.x | Client-side routes, URL state for filters and detail view. |
| **Map** | Leaflet + React-Leaflet | 1.9+ / 4.x | Interactive map, markers, clustering; no API key for base tiles (OSM). |
| **Base map tiles** | OpenStreetMap (default) | — | Free; optional swap to Mapbox for custom styling later. |
| **Clustering** | react-leaflet-cluster | 2.x | Cluster many pins in one area for performance and clarity. |
| **State (app)** | Zustand | 4.x | Filters, search query, selected restaurant, UI mode (map/list). |
| **State (server/async)** | TanStack Query (React Query) | 5.x | If we add an API later; for static JSON, optional. |
| **Data validation** | Zod | 3.x | Validate `restaurants.json` shape at load time. |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS, responsive breakpoints, consistent design. |
| **List virtualization** | TanStack Virtual | 3.x | Smooth scrolling for long restaurant lists. |
| **Search (fuzzy, optional)** | Fuse.js | 7.x | Fuzzy search by name/city/address in v2. |
| **Testing** | Vitest + React Testing Library | 1.x / 16.x | Unit and component tests. |
| **Linting / Format** | ESLint + Prettier | 9.x / 3.x | Code quality and style. |

### 2.1 Why Not…

- **Next.js:** We don’t need SSR/SSG for v1; Vite + React keeps the app simpler. We can migrate later if we need SEO or server endpoints.
- **Google Maps / Mapbox for v1:** Leaflet + OSM avoids API keys and quotas for the first version; we can add Mapbox later for styling.
- **Redux:** Zustand is enough for filter/search/selection state and is easier for a small team to reason about.
- **CSS-in-JS (styled-components, etc.):** Tailwind gives us fast iteration and built-in responsive utilities without extra runtime.

---

## 3. Feature Breakdown (Detailed)

Each feature is described with: **What it does**, **User flow**, **Technical considerations**, and **Dependencies**.

---

### 3.1 Interactive US Map with Restaurant Pins

**What it does**

- Renders a map of the **United States** (or North America) in the main view.
- Displays a **pin (marker)** for each kosher restaurant at its geographic coordinates.
- Clicking a pin **selects** that restaurant and shows a preview (name, address, brief info) or opens the detail view.
- Map supports **pan** and **zoom** so users can explore regions.
- **Marker clustering** when many pins are in one area to reduce clutter and improve performance.

**User flow**

1. User lands on the app and sees the map with pins.
2. User pans/zooms to a city or state.
3. User clicks a pin → selection feedback (pin highlight, popup or side panel).
4. User can click elsewhere or another pin to change selection.

**Technical considerations**

- **Library:** Leaflet via React-Leaflet; base tiles from OpenStreetMap (no key). Optional: Mapbox GL JS later for custom styling.
- **Data:** Each restaurant has at least `id`, `name`, `latitude`, `longitude`, and optionally `address` for tooltips.
- **Clustering:** Use `react-leaflet-cluster` (or Leaflet.markercluster) so pins in the same area group into a single cluster until zoomed in.
- **Responsive:** Map must work on desktop and mobile (touch pan/zoom). Set a minimum height (e.g., 400px on mobile, 70vh on desktop).
- **Bounds:** On initial load, fit map bounds to continental US (or to visible restaurants) so the user sees the full scope.

**Dependencies**

- Restaurant dataset with `latitude` / `longitude` (or geocoded addresses).
- No map API key required for OSM base tiles.

---

### 3.2 Restaurant Detail View (from Pin Click)

**What it does**

- When a user clicks a pin (or a list item), show a **dedicated view** with full restaurant information.
- Includes: **name**, full **address**, **phone**, **website**, **hours**, **kosher certification/agency**, **cuisine type**, and optionally **description** and **photos**.
- **CTAs:** “Get directions”, “Call”, “Website” (see optional features).

**User flow**

1. User clicks a pin or a search/list result.
2. App shows a detail panel (sidebar on desktop, bottom sheet or full screen on mobile).
3. User reads info and can tap “Directions”, “Call”, or “Website”.
4. User closes the panel or selects another restaurant.

**Technical considerations**

- **Data model:** Each restaurant has fields for all displayed attributes (see Data Model).
- **Layout:** Side panel on desktop (map stays visible); full-screen or bottom sheet on mobile so the map doesn’t feel cramped.
- **Routing:** Optional deep link, e.g. `/restaurant/:id`, so sharing a link opens that restaurant’s detail.
- **Accessibility:** Keyboard navigation (Escape to close, focus trap in modal), ARIA labels, and screen reader support for the detail view.

**Dependencies**

- Feature 3.1 (map + pins).
- Complete restaurant data schema and source (JSON or API).

---

### 3.3 “Directions” Button — Apple Maps / Google Maps

**What it does**

- A **“Directions”** (or “Get directions”) button in the restaurant detail view (and optionally in the pin popup).
- On click, open the user’s preferred maps app with the **destination** set to the restaurant’s address or coordinates.
- **Apple Maps:** `https://maps.apple.com/?daddr=...`
- **Google Maps:** `https://www.google.com/maps/dir/?api=1&destination=...`
- Optionally: **two buttons** (“Open in Apple Maps” / “Open in Google Maps”) or device detection to default one.

**User flow**

1. User is viewing a restaurant (detail or popup).
2. User clicks “Directions”.
3. New tab/window opens to Apple Maps or Google Maps with destination = restaurant address/coordinates.
4. User completes the trip in the external app.

**Technical considerations**

- **URL formats:**
  - Apple: `https://maps.apple.com/?daddr=<lat>,<lng>` or `?daddr=<encoded address>`.
  - Google: `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` or `destination=<encoded address>`.
- Use `encodeURIComponent` for address strings in query params.
- Optional: store user preference (Apple vs Google) in `localStorage`; or always show both buttons.
- Optional: pass “origin” (user’s location) if available for better routing.

**Dependencies**

- Restaurant `address` and/or `latitude`/`longitude`. Client-side only; no backend.

---

### 3.4 Restaurant Data Model and Source

**What it does**

- Defines the **structure** of a restaurant (fields and types).
- Provides the **list** of kosher restaurants that the map and UI consume.
- **v1:** Static JSON file(s) (e.g. `restaurants.json`). **v2:** Optional API or CMS.

**Data model (minimum + recommended)**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g. UUID or slug). |
| `name` | string | Yes | Display name. |
| `address` | string | Yes | Full street address. |
| `latitude` | number | Yes | WGS84. |
| `longitude` | number | Yes | WGS84. |
| `phone` | string | No | E.164 or display format. |
| `website` | string (URL) | No | Must be valid URL. |
| `hours` | string or object | No | Human-readable or structured (e.g. per day). |
| `certification` / `kosherAgency` | string | No | e.g. "OU", "OK", "Kof-K". |
| `cuisine` / `cuisineType` | string or string[] | No | e.g. "Dairy", "Pizza", "Meat". |
| `description` | string | No | Short blurb. |
| `city` | string | No | Extracted or explicit for search. |
| `state` | string | No | State code (e.g. "NY"). |
| `imageUrl` | string (URL) | No | Single hero image. |

**User flow**

- Not user-facing; underpins map pins, detail view, search, and filters.

**Technical considerations**

- **Static:** One or more JSON files (e.g. `public/restaurants.json` or imported at build time).
- **Validation:** Validate at load with **Zod** so malformed data doesn’t crash the app; TypeScript types mirror the schema.
- **Geocoding:** If only addresses exist, run a one-time geocoding (e.g. Mapbox/Google Geocoding) and store `latitude`/`longitude` in the JSON.
- **Normalization:** Normalize `certification` and `cuisine` (e.g. lowercase, trim) so filters and facets stay consistent.

**Dependencies**

- None for first load; sourcing the list is product/ops.

---

### 3.5 Search (by Name, City, or Address)

**What it does**

- A **search input** in the header or above the map.
- User types a query; app **filters** restaurants by name, city, and/or address.
- Results: **(a)** filtered pins on the map, **(b)** a list beside the map, or **(c)** both.
- “No results” message with suggestion to broaden search.

**User flow**

1. User types e.g. “pizza Brooklyn” or “Teaneck”.
2. App filters restaurants (client-side in v1).
3. Map zooms/pans to show matching pins; list shows matching items.
4. User clicks a result to open detail view.

**Technical considerations**

- **Match against:** `name`, `address`, and a dedicated `city` (or parsed from address). Case-insensitive substring match for v1.
- **Debounce:** 300 ms on input to avoid filtering on every keystroke.
- **v2:** Fuzzy search (e.g. Fuse.js) or backend full-text search for scale.
- **Sync:** Search state can live in URL (e.g. `?q=pizza`) for shareable links.

**Dependencies**

- Data model/source; map and list UI.

---

### 3.6 Filters (Certification, Cuisine, Open Now)

**What it does**

- **Filter controls** (dropdowns, checkboxes, or chips) to narrow restaurants.
- Examples: **Kosher certification** (OU, OK, Kof-K), **cuisine type** (dairy, meat, pizza, etc.), **Open now** (if hours data exists).
- Filter state applies to **map pins** and **list**: only matching restaurants are shown.

**User flow**

1. User opens filters (sidebar or inline).
2. User selects e.g. “OU” and “Pizza”.
3. Map and list update to show only OU-certified pizza places.
4. User clears filters to see all again.

**Technical considerations**

- **Combine with search:** Apply filters on top of search (or one combined predicate).
- **“Open now”:** Requires parseable `hours` and current time + timezone (e.g. `date-fns` or `dayjs`).
- **URL:** Persist in query params (e.g. `?cert=OU&cuisine=pizza`) for shareable/bookmarkable views.
- **Options:** Filter options derived from data (e.g. unique certifications) so they stay in sync.

**Dependencies**

- Data model (certification, cuisine, hours); map and list.

---

### 3.7 List View (Alternative to Map)

**What it does**

- A **scrollable list** of restaurants (cards or rows) in addition to (or toggled with) the map.
- Each item: name, address snippet, certification, cuisine.
- Clicking an item **selects** that restaurant (highlights pin if map visible, opens detail view).
- List can be filtered by **search/filters** and optionally by **current map bounds** (only restaurants in viewport).

**User flow**

1. User toggles or lands on “List” view.
2. User scrolls; clicking an item opens detail or focuses map on that pin.
3. Optional: list and map stay in sync (e.g. list shows only restaurants in viewport).

**Technical considerations**

- **Layout:** List left/right of map on desktop; tab or toggle on mobile (Map | List).
- **Virtualization:** Use **TanStack Virtual** (or react-window) for long lists to keep scrolling smooth.
- **Sync:** When map moves/zooms, optionally filter list to “restaurants in current bounds”.

**Dependencies**

- Data; map; search and filters.

---

### 3.8 Responsive Layout and Mobile UX

**What it does**

- App works on **desktop**, **tablet**, and **mobile**.
- Map is usable with **touch** (pan, zoom, tap pins).
- **Navigation:** Header with logo, search, and menu (filters, list/map toggle); on mobile, filters in drawer or bottom sheet.
- **Restaurant detail:** On mobile, full-screen or bottom sheet; “Directions” / “Call” / “Website” are large touch targets.

**User flow**

1. User opens the app on phone or desktop.
2. Layout adapts (stacked vs side-by-side).
3. User can find a restaurant, open detail, and get directions without horizontal scrolling or tiny buttons.

**Technical considerations**

- **CSS:** Tailwind breakpoints (e.g. `sm:`, `md:`, `lg:`); flexbox/grid.
- **Touch:** Ensure Leaflet touch handlers work; avoid double-tap zoom conflicts if needed.
- **Performance:** Consider fewer pins at low zoom or lazy loading images on mobile.

**Dependencies**

- All UI features adapted to breakpoints.

---

### 3.9 Optional: “Call” and “Website” Actions

**What it does**

- In the restaurant detail view (and optionally in the pin popup): **“Call”** and **“Website”** buttons.
- **Call:** Opens device dialer via `tel:<number>`.
- **Website:** Opens restaurant URL in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.

**User flow**

1. User is in the detail view.
2. User taps “Call” → phone app opens with number pre-filled.
3. User taps “Website” → browser opens restaurant site in new tab.

**Technical considerations**

- Show “Call” only if `phone` exists; “Website” only if `website` exists.
- Validate website URL to avoid `javascript:` or invalid links (e.g. allow only `http`/`https`).

**Dependencies**

- Detail view and data model (phone, website).

---

### 3.10 Optional: Favorites / Saved Restaurants

**What it does**

- User can **save** or **favorite** a restaurant (e.g. heart icon).
- Saved list is **persisted** (e.g. `localStorage` or account-based backend).
- A “Favorites” view or filter shows only saved restaurants on the map and/or in the list.

**User flow**

1. User opens a restaurant and taps “Add to favorites”.
2. Restaurant is added (visual feedback).
3. User opens “Favorites” and sees saved restaurants; can remove from favorites.

**Technical considerations**

- **localStorage:** Store array of restaurant IDs; no backend for v1.
- **Auth later:** Sync favorites to backend per user.
- **UI:** Different pin color or heart icon for favorited restaurants.

**Dependencies**

- Detail view and stable restaurant IDs.

---

### 3.11 Optional: Geolocation (“Near Me”)

**What it does**

- A **“Near me”** or **“Use my location”** button that requests the user’s position (browser Geolocation API).
- Map **centers** on the user; optionally show a “you are here” marker and **sort/filter list by distance**.

**User flow**

1. User taps “Near me”.
2. Browser asks for location permission; user allows.
3. Map centers on user; optionally “you are here” marker and list sorted by distance.

**Technical considerations**

- **HTTPS** required for geolocation in production.
- Handle **permission denied** and errors (timeout, unavailable).
- **Distance:** Haversine formula from user lat/lng to each restaurant for sorting/filtering.

**Dependencies**

- Map and restaurant coordinates.

---

## 4. Implementation Order (8-Part Build)

Use this order so each part builds on the previous one and critical features ship first.

| Part | Feature | Why this order |
|------|--------|----------------|
| **1** | **Data model and source** (3.4) | Everything depends on a defined schema and at least a minimal static dataset (e.g. `restaurants.json` with sample entries). |
| **2** | **Interactive US map with pins** (3.1) | Core experience: map + pins from data. Clicking a pin can show a simple tooltip (name + address). |
| **3** | **Restaurant detail view** (3.2) | Clicking a pin opens a proper detail panel/page with full info. |
| **4** | **“Directions” button** (3.3) | High-value action; small implementation once detail view exists. |
| **5** | **Search** (3.5) | Makes the app usable at scale (name, city, address). |
| **6** | **Filters** (3.6) | Certification, cuisine, optional “open now”. Improves discovery. |
| **7** | **List view** (3.7) | Alternative to map; sync with map and filters. |
| **8** | **Responsive layout and mobile UX** (3.8) | Polish so all of the above work on small screens and touch. |

**Optional (after Part 8 or where they fit):**

- **Call & Website** (3.9) — e.g. with Part 4.
- **Favorites** (3.10) — after Part 7.
- **Near me** (3.11) — after Part 5 or 6.

---

## 5. For Junior Developers: Tech Stack Explained

*Written from a senior developer’s perspective to help you understand why we chose each piece and how they work together.*

---

### 5.1 TypeScript

We use **TypeScript** so that the shape of our data (e.g. `Restaurant`) is defined in one place. When you pass a restaurant into a component or a function, the IDE and the compiler will catch typos and wrong types before the code runs. For this app, that’s especially important for the restaurant object: missing or wrong `latitude`/`longitude` would break the map. Define interfaces or types for `Restaurant`, `RestaurantDetail`, and filter state, and use them everywhere.

---

### 5.2 React + Vite

**React** gives us a component-based UI: the map, the list, the detail panel, and the search bar are separate components that receive data via props and communicate via state/callbacks. We use **Vite** instead of Create React App because it’s faster (native ESM, less bundling work) and the config is simpler. You’ll run `npm run dev` for the dev server and `npm run build` for production; the output goes to `dist/`.

---

### 5.3 React Router

**React Router** handles which “page” or view is visible. We use it for:

- **Routes:** e.g. `/` (map + list), `/restaurant/:id` (detail).
- **URL state:** Search and filters in query params (e.g. `?q=pizza&cert=OU`) so users can share or bookmark a filtered view.

That means the app’s state isn’t only in memory—it’s in the URL, which is better for usability and debugging.

---

### 5.4 Leaflet + React-Leaflet

**Leaflet** is the map engine; **React-Leaflet** wraps it in React components. You’ll use `<MapContainer>`, `<TileLayer>`, and `<Marker>` (or a custom marker component). We chose Leaflet over Google Maps or Mapbox for v1 because:

- We can use **OpenStreetMap** tiles without an API key.
- The API is straightforward: add a marker per restaurant, handle click to set “selected” restaurant.
- **Clustering** (via react-leaflet-cluster) groups nearby pins into one marker until the user zooms in, which keeps the map readable and performant.

Important: Leaflet expects to run in the browser (it uses `window`/DOM). If you use SSR later, you’ll need to load the map only on the client (e.g. dynamic import or a “map container” that mounts only in the browser).

---

### 5.5 Zustand

**Zustand** holds **global UI state** that many components need: current search query, active filters, selected restaurant ID, and whether the user is in “map” or “list” view. We use it instead of Redux because we don’t need middleware or heavy boilerplate—just a store with slices and actions. Example: a `useAppStore` hook that exposes `searchQuery`, `setSearchQuery`, `filters`, `setFilters`, and `selectedRestaurantId`. The map, list, and detail panel all read from and update this store so they stay in sync.

---

### 5.6 Zod

**Zod** validates the shape of our restaurant data when we load it (e.g. from `restaurants.json`). If the file has a typo in a field name or a wrong type (e.g. a string where we expect a number for `latitude`), Zod will throw a clear error at load time instead of failing later when we try to render the map. Define a schema like `RestaurantSchema` and parse the JSON with `RestaurantSchema.array().parse(data)`. The same schema can drive TypeScript types with `z.infer<typeof RestaurantSchema>` so we have one source of truth.

---

### 5.7 Tailwind CSS

**Tailwind** gives us utility classes (e.g. `flex`, `gap-4`, `md:flex-row`, `text-lg`) instead of writing custom CSS for every component. Benefits: consistent spacing and typography, and **responsive design** is built in (e.g. `md:` for tablet, `lg:` for desktop). For this app, use it for the header, the map container, the side panel, and the list so the layout stacks on mobile and sits side-by-side on larger screens. Keep the Tailwind config in one place so we can adjust colors and breakpoints globally.

---

### 5.8 TanStack Virtual (List)

When we have hundreds or thousands of restaurants, rendering every row in the list would be slow. **TanStack Virtual** only renders the rows that are visible in the scroll area (plus a small buffer), so the DOM stays small and scrolling stays smooth. You’ll pass the filtered list of restaurants into the virtual list component and render each visible item; the library handles scroll position and item height (fixed or variable).

---

### 5.9 Optional: Fuse.js (Fuzzy Search)

For v1, a simple **substring** match on name, city, and address is enough. If we add **Fuse.js** later, we get fuzzy search: typos and partial words still match (e.g. “Teanek” → “Teaneck”). You’d build a Fuse instance from the restaurant list and call `fuse.search(query)` on debounced input; then use the results to drive both the map markers and the list.

---

### 5.10 How It Fits Together

- **Data:** We load `restaurants.json`, validate with Zod, and store the array in memory (or in a Zustand slice / React Query if we add an API).
- **Map:** React-Leaflet renders the map and one marker per restaurant; marker click updates Zustand `selectedRestaurantId` and/or the route to `/restaurant/:id`.
- **Detail:** The detail panel reads `selectedRestaurantId` from the store (or from the route), finds the restaurant in the list, and renders name, address, hours, “Directions”, “Call”, “Website”.
- **Search & filters:** The search input and filter controls update Zustand (and optionally the URL). A derived “filtered restaurants” list is computed from the full list + search + filters; the map and the list both consume this same list.
- **Directions:** “Directions” builds an Apple Maps or Google Maps URL with the restaurant’s address or lat/lng and opens it in a new tab.

If you keep **data flow** in mind (single source of truth for restaurants and for “what’s selected / what’s filtered”), the rest is wiring components to that state and to the URL.

---

## 6. Non-Functional Requirements

- **Performance:** Initial load &lt; 3 s on 3G; map pan/zoom and list scroll without noticeable jank.
- **Accessibility:** Keyboard navigable; focus management in modals; ARIA where needed; contrast and touch targets per WCAG 2.1 AA where feasible.
- **Browser support:** Last two versions of Chrome, Firefox, Safari, Edge; mobile Safari and Chrome on iOS/Android.
- **Security:** No injection of user input into `tel:` or `https:` links; validate and sanitize URLs for “Website” (allow only `http`/`https`).
- **Data:** If we add an API later, use HTTPS and avoid exposing internal keys in the client.

---

## 7. Acceptance Criteria (Summary)

- [ ] Map loads with OSM (or chosen) tiles and shows pins for all restaurants in the current dataset.
- [ ] Clicking a pin selects the restaurant and shows detail (panel or page) with name, address, phone, website, hours, certification, cuisine.
- [ ] “Directions” opens Apple Maps or Google Maps with the correct destination.
- [ ] Search filters restaurants by name, city, and address; map and list show only matches.
- [ ] Filters (certification, cuisine, optional “open now”) narrow results; state reflected in map, list, and URL.
- [ ] List view shows the same filtered set; clicking an item selects the restaurant and updates map/detail.
- [ ] Layout is responsive; map and actions work on touch devices.
- [ ] Optional: Call and Website buttons work when data exists; Favorites persist in localStorage; “Near me” centers map and optionally sorts by distance.

---

## 8. Summary Tables

### Features

| # | Feature | Core? | Depends on |
|---|--------|-------|------------|
| 1 | Interactive US map with pins | Yes | Data (4) |
| 2 | Restaurant detail view | Yes | Map (1), Data (4) |
| 3 | Directions → Apple/Google Maps | Yes | Detail (2), Data (4) |
| 4 | Data model and source | Yes | — |
| 5 | Search (name, city, address) | Yes | Data (4), Map (1) |
| 6 | Filters (certification, cuisine, etc.) | Yes | Data (4), Map (1) |
| 7 | List view | Yes | Data (4), Map (1), Search/Filters (5,6) |
| 8 | Responsive + mobile UX | Yes | All UI features |
| 9 | Call & Website buttons | Optional | Detail (2), Data (4) |
| 10 | Favorites / saved restaurants | Optional | Detail (2), Data (4) |
| 11 | Geolocation “Near me” | Optional | Map (1), Data (4) |

### Implementation prompts (per part)

You can turn each of the 8 parts into a single implementation prompt, e.g.:

- **Part 1:** “Implement Part 1: Data model and source. Context: PRD §3.4. Requirements: Define TypeScript types and Zod schema for Restaurant; add `restaurants.json` with at least 5 sample entries including id, name, address, lat/lng, phone, website, hours, certification, cuisine. Load and validate on app init.”
- **Part 2:** “Implement Part 2: Interactive US map with pins. Context: PRD §3.1. Use React-Leaflet and OSM tiles; render one marker per restaurant; on pin click show tooltip with name and address and set selected restaurant in state.”
- **Part 3:** “Implement Part 3: Restaurant detail view. Context: PRD §3.2. On pin/list click open a side panel (desktop) or full-screen (mobile) with full restaurant info. Support route `/restaurant/:id`.”
- … and so on for Parts 4–8 and optional features.

---

## 9. Appendix: URL and Data Conventions

### 9.1 URL query params (suggested)

- `q` — search query
- `cert` — certification (e.g. OU, OK)
- `cuisine` — cuisine type (e.g. pizza, dairy)
- `openNow` — 1 or true for “open now” filter

Example: `/?q=brooklyn&cert=OU&cuisine=pizza`

### 9.2 Directions URL formats

- **Apple Maps:** `https://maps.apple.com/?daddr=${encodeURIComponent(address)}` or `?daddr=${lat},${lng}`
- **Google Maps:** `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}` or `&destination=${lat},${lng}`

### 9.3 Example restaurant JSON (minimal)

```json
{
  "id": "rest-1",
  "name": "Example Kosher Grill",
  "address": "123 Main St, Brooklyn, NY 11201",
  "latitude": 40.6782,
  "longitude": -73.9442,
  "phone": "+12125551234",
  "website": "https://example.com",
  "hours": "Mon–Thu 11am–10pm; Fri 11am–3pm; Sun 12pm–10pm",
  "certification": "OU",
  "cuisine": ["Meat", "Grill"],
  "city": "Brooklyn",
  "state": "NY"
}
```

---

*End of PRD.*
