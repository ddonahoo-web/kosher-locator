# PRD Review — Kosher Restaurant Locator

Quick review of the PRD before implementation. Overall the document is **strong and implementation-ready**. Below are minor issues and clarifications.

---

## Issues / Suggestions

### 1. **Date typo**
- **PRD:** "Last updated: February **2025**"
- **Suggestion:** Update to **2026** if that’s the correct year (or leave as 2025 if intentional).

### 2. **Data model field names**
- **PRD:** Table in §3.4 uses "certification / kosherAgency" and "cuisine / cuisineType" (two options each).
- **Suggestion:** Pick one name per concept and use it everywhere (code, schema, JSON). The example JSON uses `certification` and `cuisine`; recommend standardizing on **`certification`** and **`cuisine`** (with `cuisine` as `string | string[]`) and removing the slash alternatives from the doc to avoid confusion.

### 3. **Clustering package name**
- **PRD:** "react-leaflet-cluster 2.x"
- **Note:** The exact npm package for React-Leaflet v4 may be different (e.g. `react-leaflet-cluster` or a fork). When implementing Part 2, confirm the package name and compatibility with React-Leaflet 4.x; fallback is to use **Leaflet.markercluster** with a small custom wrapper if needed.

### 4. **“Open now” filter**
- **PRD:** Filter by “Open now” using `hours`.
- **Note:** Example `hours` is human-readable ("Mon–Thu 11am–10pm; …"), which is hard to parse reliably. For **v1**, either (a) treat “Open now” as optional and implement only if you add structured hours (e.g. per-day open/close), or (b) document that “Open now” is out of scope for v1. This avoids over-promising.

### 5. **Restaurant JSON location**
- **PRD:** "e.g. `public/restaurants.json` or imported at build time"
- **Suggestion:** Decide up front: **`public/restaurants.json`** (fetch at runtime, no key in bundle) vs **`src/data/restaurants.json`** (import + validate at build). Part 1 prompt below uses **`public/restaurants.json`** with fetch + Zod at app init; you can switch to build-time import if you prefer.

### 6. **Geolocation (optional)**
- **PRD:** "HTTPS required for geolocation in production" — correct. No change needed; just ensure production is served over HTTPS when you add “Near me”.

---

## Verdict

- **No blocking issues.** You can start building with the current PRD.
- The 8-part implementation order in §4 is logical; the prompts below follow it.
- Optional features (Call/Website, Favorites, Near me) are clearly scoped for after the core 8 parts.

Use the **8 prompts** in `BUILD-PROMPTS.md` in order; each prompt is self-contained and references the PRD where needed.
