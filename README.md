KosherEats 🍽️
A Yelp-inspired web application for discovering kosher restaurants across the United States. Search, filter, and explore kosher dining options on an interactive map.
🌐 Live App: www.kosherrestaurantlocator.com

Tech Stack

React 18 — Component-based UI
TypeScript 5 — Type safety
Vite 5 — Fast development server and production builds
Leaflet + React-Leaflet — Interactive map with markers and clustering
Zustand — Global state management
Tailwind CSS — Utility-first styling
Zod — Runtime data validation
TanStack Virtual — Virtualized list rendering


Features

🗺️ Interactive map with numbered markers and clustering
🔍 Live search by name, address, city, or state
🏅 Filter by kosher certification (OU, OK, Kof-K, Star-K, etc.)
🍜 Filter by cuisine type
📊 7 sort options including rating, review count, and price
📱 Fully responsive — works on desktop and mobile
🖥️ Slide-in restaurant detail panel with directions, phone, and website links


Getting Started
Prerequisites

Node.js 18+
npm 9+

Installation
bashgit clone https://github.com/ddonahoo-web/kosher-locator.git
cd kosher-locator
npm install
Running Locally
bashnpm run dev
The app will be available at http://localhost:5173.
Other Commands
bashnpm run build      # Build for production (outputs to dist/)
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint

Project Structure
public/
  restaurants.json        # Static restaurant dataset
src/
  App.tsx                 # Root layout and data loading
  main.tsx                # React entry point
  index.css               # Global styles and Tailwind directives
  schema/
    restaurant.ts         # Zod schema and TypeScript types
  store/
    useAppStore.ts        # Zustand store with filter/sort/search logic
  components/
    Header.tsx            # Top bar with logo and search
    FilterPanel.tsx       # Certification chips, cuisine dropdown, map/list toggle
    RestaurantList.tsx    # Virtualized list with sort controls
    RestaurantMap.tsx     # Leaflet map with markers and clustering
    RestaurantDetail.tsx  # Slide-in detail overlay panel
    StarRating.tsx        # SVG star rating component

Deployment
This app is deployed on Railway and served at a custom domain via GoDaddy DNS.

Platform: Railway
Build command: npm run build
Start command: npm run preview
Domain: www.kosherrestaurantlocator.com


License
This project was created for academic purposes.
