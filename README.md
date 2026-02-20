# Kosher Restaurant Locator

A web app to discover and navigate to kosher restaurants across the United States: interactive map, search, filters, list view, and directions.

## Documentation

- **[Product Requirements Document (PRD)](docs/PRD.md)** — Full product spec, feature breakdown, tech stack, implementation order, and a senior-to-junior tech explanation.

## Tech stack (summary)

- **React 18** + **TypeScript** + **Vite**
- **Leaflet** / **React-Leaflet** (map) + **OpenStreetMap** tiles
- **Zustand** (state), **Zod** (data validation), **Tailwind CSS** (styling)
- **React Router** (routing + URL state)

See the [PRD § Tech Stack](docs/PRD.md#2-tech-stack-specific) and [For Junior Developers](docs/PRD.md#5-for-junior-developers-tech-stack-explained) for details and rationale.

## Implementation

Follow the **8-part implementation order** in the PRD (data → map → detail → directions → search → filters → list → responsive). Each part has a suggested implementation prompt in [PRD § Summary Tables](docs/PRD.md#8-summary-tables).
