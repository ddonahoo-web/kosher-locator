# Kosher Restaurant Locator — 8 Build Prompts (Chronological)

Use these prompts **in order**. Each assumes the previous parts are done. Context: `docs/PRD.md`.

---

## Prompt 1 — Data model and source

**Context:** PRD §3.4 (Data Model and Source).

**Task:** Implement Part 1: Data model and source for the Kosher Restaurant Locator.

1. **Tech stack:** TypeScript, React 18, Vite 5. Bootstrap the app with this stack if the project is empty (Vite + React + TypeScript template).
2. **Schema and types:**
   - Define a **Zod** schema for a single restaurant with: `id` (string), `name` (string), `address` (string), `latitude` (number), `longitude` (number), and optional: `phone`, `website` (URL), `hours` (string), `certification` (string), `cuisine` (string or array of strings), `description`, `city`, `state`, `imageUrl` (URL). All per PRD §3.4 table.
   - Export a TypeScript type for `Restaurant` derived from this schema (e.g. `z.infer`).
3. **Data file:**
   - Add `public/restaurants.json` with **at least 5 sample** kosher restaurants across the US. Each must have `id`, `name`, `address`, `latitude`, `longitude`; include a mix of optional fields (phone, website, hours, certification, cuisine, city, state) so filters and detail view can be tested later.
4. **Load and validate:**
   - On app init, fetch `restaurants.json` (from `/restaurants.json`), parse with the Zod schema (array of restaurants), and handle parse errors (e.g. log and show a simple error state). Keep the validated list in memory (e.g. React state or a simple module) so the next part can consume it.
5. **Dependencies:** Add and pin `zod` (3.x). No map or UI beyond a minimal app shell that loads and validates the data (e.g. "Loaded N restaurants" or an error message).

---

## Prompt 2 — Interactive US map with pins

**Context:** PRD §3.1 (Interactive US Map with Restaurant Pins).

**Task:** Implement Part 2: Interactive US map with restaurant pins.

1. **Assumptions:** Part 1 is done: validated restaurant list is available (from state or module) with `id`, `name`, `address`, `latitude`, `longitude` at minimum.
2. **Map stack:** Use **Leaflet** with **React-Leaflet** (e.g. 4.x). Base tiles: **OpenStreetMap** (no API key). Add **marker clustering** (e.g. `react-leaflet-cluster` or Leaflet.markercluster compatible with React-Leaflet 4) so pins in the same area group until the user zooms in.
3. **Behavior:**
   - Render one marker per restaurant from the validated list.
   - **Initial bounds:** Fit the map to the continental US (or to the bounding box of all restaurant coordinates) on first load so the full scope is visible.
   - **Pin click:** When the user clicks a pin, (a) show a **tooltip or popup** with the restaurant name and address, and (b) set the **selected restaurant** in app state (Zustand store: e.g. `selectedRestaurantId`). No detail panel yet—selection is enough.
4. **Responsive:** Map container has a minimum height (e.g. 400px on mobile, 70vh on desktop). Ensure pan and zoom work with touch on mobile.
5. **State:** Introduce a **Zustand** store with at least: `selectedRestaurantId` (string | null) and `setSelectedRestaurantId`. The map and (later) detail view will read from this.
6. **Dependencies:** Add `leaflet`, `react-leaflet`, and a clustering solution compatible with React-Leaflet. Import Leaflet CSS in the app (e.g. in main entry or layout).

---

## Prompt 3 — Restaurant detail view

**Context:** PRD §3.2 (Restaurant Detail View).

**Task:** Implement Part 3: Restaurant detail view.

1. **Assumptions:** Parts 1 and 2 are done: map with pins, Zustand store with `selectedRestaurantId`, and validated restaurant list available.
2. **Detail content:** When a restaurant is selected (by pin click or later by list click), show a **detail view** with: name, full address, phone, website, hours, certification (kosher agency), cuisine, and optionally description and image. Omit fields that are missing (e.g. no "Call" if no phone).
3. **Layout:**
   - **Desktop:** Side panel (e.g. right or left of the map) so the map stays visible. Panel can slide in or be always visible when a restaurant is selected.
   - **Mobile:** Full-screen or bottom sheet so the map doesn’t feel cramped. User can close to return to the map.
4. **Routing:** Add **React Router** (6.x). Support route **`/restaurant/:id`**. When the user navigates to `/restaurant/:id`, set `selectedRestaurantId` and show the detail view. When the user selects a pin, update the URL to `/restaurant/:id` (and vice versa). Ensure the detail view reads from the route and/or store so that direct links and back/forward work.
5. **Accessibility:** Detail panel/modal: Escape to close, focus trap when open, and ARIA labels where appropriate. Close button or tap-outside to close on mobile.
6. **Dependencies:** Add `react-router-dom` (6.x). Wire the router in the app root and use the existing Zustand store so map and detail stay in sync with the URL.

---

## Prompt 4 — “Directions” button + Call & Website (optional)

**Context:** PRD §3.3 (Directions), §3.9 (Call and Website).

**Task:** Implement Part 4: Directions and optional Call/Website actions.

1. **Assumptions:** Part 3 is done: restaurant detail view shows full info and has a place for action buttons.
2. **Directions:**
   - Add a **“Get directions”** (or “Directions”) button in the restaurant detail view (and optionally in the pin popup).
   - On click, open **Apple Maps** and **Google Maps** in a new tab. Use PRD §9.2: Apple `https://maps.apple.com/?daddr=...`, Google `https://www.google.com/maps/dir/?api=1&destination=...`. Use either the restaurant’s address (with `encodeURIComponent`) or `latitude,longitude`. Prefer showing **both** “Open in Apple Maps” and “Open in Google Maps” (two buttons or links); optionally add a simple device/preference detection later.
3. **Call (optional):** If the restaurant has a `phone` field, show a **“Call”** button that opens the device dialer via `tel:<number>`. Omit if no phone.
4. **Website (optional):** If the restaurant has a `website` field, show a **“Website”** button that opens the URL in a new tab with `target="_blank"` and `rel="noopener noreferrer"`. Validate that the URL is `http` or `https` only (no `javascript:` or other schemes). Omit if no website.
5. **Security:** Do not inject unsanitized user input into `tel:` or `https:`; use validated fields from the Zod-validated data only.

---

## Prompt 5 — Search (name, city, address)

**Context:** PRD §3.5 (Search).

**Task:** Implement Part 5: Search by name, city, and address.

1. **Assumptions:** Parts 1–4 are done: map, pins, detail view, directions/Call/Website, and full restaurant list in state or memory.
2. **Search UI:** Add a **search input** in the header or above the map. Place it so it’s visible on both map and (when implemented) list view.
3. **Behavior:**
   - User types a query; the app **filters** restaurants by **name**, **city**, and **address** (case-insensitive substring match). Combine into one predicate (e.g. match if any of the three contains the query).
   - **Debounce:** 300 ms on input so filtering doesn’t run on every keystroke.
   - **Results:** (a) Only matching restaurants are shown as **pins on the map**. (b) If a list view exists, it shows the same filtered set. (c) If no results, show a clear “No results” message and suggest broadening the search.
4. **State:** Store the search query in the **Zustand** store (e.g. `searchQuery`, `setSearchQuery`). Compute a single **filtered restaurant list** from: full list + search query. Map and list (Part 7) should both consume this filtered list.
5. **URL:** Optional but recommended: sync search to the URL (e.g. `?q=...`) so views are shareable and bookmarkable. Read initial `q` from the URL on load and update the URL when the user types (with debounce or on blur).

---

## Prompt 6 — Filters (certification, cuisine, optional “Open now”)

**Context:** PRD §3.6 (Filters).

**Task:** Implement Part 6: Filters for certification, cuisine, and optionally “Open now”.

1. **Assumptions:** Parts 1–5 are done: map, detail, directions, and search with a single filtered list and Zustand store.
2. **Filter UI:** Add **filter controls** (dropdowns, checkboxes, or chips) for: (a) **Kosher certification** (e.g. OU, OK, Kof-K), (b) **Cuisine type** (e.g. dairy, meat, pizza). Derive the list of options from the data (unique values from the restaurant list). If `hours` is structured and parseable, add (c) **“Open now”**; otherwise skip “Open now” for v1 or document it as future work.
3. **Behavior:**
   - Filters apply **on top of search**: first filter by search query, then by certification/cuisine (and open now if implemented). Only restaurants matching **all** active filters and search are shown on the map and in the list.
   - “Clear filters” resets certification and cuisine (and open now) so all results (for the current search) are shown again.
4. **State:** Store filter state in Zustand (e.g. `certification`, `cuisine`, `openNow` and setters). Compute the **filtered restaurant list** as: full list → apply search → apply filters. Map and list consume this same list.
5. **URL:** Persist filters in query params (e.g. `?cert=OU&cuisine=pizza`) per PRD §9.1. Read on load and update when user changes filters so URLs are shareable.

---

## Prompt 7 — List view (with virtualization)

**Context:** PRD §3.7 (List View).

**Task:** Implement Part 7: List view as an alternative to the map.

1. **Assumptions:** Parts 1–6 are done: map, detail, search, filters, and a single filtered restaurant list used by the map.
2. **List UI:** Add a **scrollable list** of restaurants (cards or rows). Each item shows: name, address snippet (e.g. city/state or first line), certification, cuisine. Clicking an item **selects** that restaurant: set `selectedRestaurantId` in the store and open the detail view (and update route to `/restaurant/:id`). If the map is visible, highlight or focus the corresponding pin.
3. **Layout:** On **desktop**, show the list beside the map (e.g. list left, map right, or vice versa). On **mobile**, use a **Map | List** toggle or tabs so the user switches between map and list view. Store the view mode (map vs list) in Zustand if needed (e.g. for mobile toggle).
4. **Data source:** The list uses the **same filtered list** as the map (search + filters). No separate data path.
5. **Virtualization:** Use **TanStack Virtual** (e.g. `@tanstack/react-virtual` 3.x) so only visible rows (plus a small buffer) are rendered. This keeps scrolling smooth with hundreds of restaurants. Pass the filtered array and a fixed or estimated row height as needed.
6. **Optional:** When the map is visible and the user pans/zooms, optionally filter the list to “restaurants in current map bounds” so list and map viewport stay in sync. If time-constrained, ship without this and add later.

---

## Prompt 8 — Responsive layout and mobile UX

**Context:** PRD §3.8 (Responsive Layout and Mobile UX).

**Task:** Implement Part 8: Responsive layout and mobile UX polish.

1. **Assumptions:** Parts 1–7 are done: map, detail, directions, search, filters, and list view with Map/List toggle on mobile.
2. **Breakpoints:** Use **Tailwind** breakpoints (e.g. `sm:`, `md:`, `lg:`) so that:
   - **Header:** Logo, search bar, and primary actions (filters, map/list toggle) are visible and usable. On small screens, put filters in a drawer or bottom sheet and keep search and toggle in the header.
   - **Main area:** Map and list layout: side-by-side on desktop/tablet, stacked or toggled (Map | List) on mobile. Map has minimum height (e.g. 400px) and flexible height (e.g. 70vh) on larger screens.
   - **Detail view:** Side panel on desktop; full-screen or bottom sheet on mobile with large touch targets for Directions, Call, Website.
3. **Touch:** Ensure Leaflet pan/zoom and pin taps work well on touch devices. Avoid double-tap zoom conflicts if any (e.g. via Leaflet options). Buttons and links should meet touch target size (e.g. ~44px) where feasible (WCAG 2.1).
4. **Performance:** If the list or map is heavy on low-end devices, consider reducing visible pins at low zoom or lazy-loading images in the list/detail. Not required for v1 if current performance is acceptable.
5. **Accessibility:** Keyboard navigation (Tab, Enter, Escape), focus management when opening/closing detail and filter panels, and ARIA labels for icon-only buttons. Check contrast and focus indicators.

After Part 8, the core app is complete. Optional features (Favorites with localStorage, “Near me” geolocation) can be added with separate prompts referencing PRD §3.10 and §3.11.
