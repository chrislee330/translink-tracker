# TransLink Live Tracker

A real-time public transit tracking application for Vancouver's TransLink system, providing live vehicle positions, interactive route maps, and arrival predictions. Built as a tool for me to use as a daily commuter.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development Journey](#development-journey)
- [Challenges & Solutions](#challenges--solutions)
- [Acknowledgments](#acknowledgments)
---

## Features

### Interactive Route Visualization
- **Live vehicle tracking** with 30-second auto-refresh
- **Color-coded route lines** following actual street paths
- **500+ stop markers** with detailed information
- **Bus icons** showing vehicle heading and speed
- **Layered map controls** to show/hide stops and routes

### Real-time Arrival Predictions
- **Single-stop view** showing next 5 arrivals with countdown timers
- **All-stops schedule board** displaying up to 24 hours of predictions
- **Delay indicators** showing on-time, late, or early status
- **Route filtering** to focus on specific transit lines

### User Experience
- **Route selector** with visual badges and persistent preferences
- **Manual refresh button** with loading states (TODO)

### Data Features
- **Trip headsigns** showing vehicle destinations (e.g., "To UBC", "To Boundary")
- **Vehicle information** including ID, speed, and status
- **Stop details** with stop codes and names
- **Real-time updates** every 30-60 seconds
- **localStorage persistence** for user preferences

---

## Tech Stack

### Frontend
- **React 18**
- **Vite**
- **Tailwind CSS**
- **Leaflet.js**
- **React-Leaflet**

### APIs & Data
- **GTFS Static** - Schedule data (routes, stops, shapes, trips)
- **GTFS Realtime** - Live vehicle positions and arrival predictions
- **Protocol Buffers** - realtime feeds
- **TransLink API** - Vancouver's public transit data

### Libraries
- **gtfs-realtime-bindings** - Protobuf parsing
- **Papaparse** - CSV parsing for GTFS Static data
---

## Project Structure
```
translink-tracker/
├── public/
│   └── data/
│       └── gtfs/              # GTFS Static files
│           ├── routes.txt
│           ├── stops.txt
│           ├── shapes.txt
│           ├── trips.txt
│           └── stop_times.txt (optional)
├── src/
│   ├── components/
│   │   ├── Map.jsx            # Main map component
│   │   ├── VehicleMarker.jsx  # Bus icon markers
│   │   ├── StopMarker.jsx     # Stop markers
│   │   ├── RouteSelector.jsx  # Route selection UI
│   │   ├── RouteLegend.jsx    # Active routes legend
│   │   ├── MapControls.jsx    # Map control buttons
│   │   ├── StopArrivalsPanel.jsx     # Single stop arrivals
│   │   └── AllStopsArrivals.jsx      # Schedule board
│   ├── services/
│   │   ├── gtfsStatic.js      # GTFS Static data loading
│   │   └── gtfsRealtime.js    # GTFS Realtime API calls
│   ├── utils/
│   │   ├── constants.js       # Route configurations
│   │   ├── storage.js         # localStorage helpers
│   │   └── leafletConfig.js   # Leaflet setup
│   ├── App.jsx                # Root component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind setup
├── package.json               # Dependencies
└── README.md                  # This file
```

### CORS Configuration

The Vite proxy handles CORS issues:
```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api/translink': {
        target: 'https://gtfsapi.translink.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/translink/, ''),
        secure: false,
      },
    },
  },
})
```

---

## Development Journey

This project was built by Phases:

### Phase 1: Foundation (Commits 1-3)
- React + Vite + Tailwind setup
- Leaflet.js map integration
- GTFS Static data parsing and route visualization

### Phase 2: Interactivity (Commits 4-5)
- Route selector UI with localStorage
- Stop markers with show/hide controls

### Phase 3: Real-time Features (Commits 6-7)
- GTFS Realtime API integration
- Live vehicle tracking with auto-refresh
- Trip headsigns and destinations

### Phase 4: Arrivals (Commits 8)
- Single stop arrival predictions
- (todo) Comprehensive schedule board
- (todo) Manual refresh controls

---

## Challenges & Solutions

### Challenge 1: CORS Errors
**Problem:** TransLink API doesn't allow direct browser requests.

**Solution:** Configured Vite proxy to forward requests server-side:
```javascript
proxy: {
  '/api/translink': {
    target: 'https://gtfsapi.translink.ca',
    changeOrigin: true
  }
}
```

### Challenge 2: Large GTFS Files
**Problem:** `stop_times.txt` is 50MB+ causing slow load times.

**Solution:**
- Skip loading `stop_times.txt` initially
- Only load for features that need it
- Consider pre-processing data into smaller JSON files

### Challenge 3: Stop ID Mismatches
**Problem:** Stop IDs in static data don't match realtime data (e.g., "12345" vs "012345").

**Solution:** Normalize stop IDs by removing leading zeros:
```javascript
const normalizeStopId = (id) => String(id).replace(/^0+/, '') || '0';
```

### Challenge 4: Real-time Updates Without Lag
**Problem:** Refreshing data every 30 seconds causes UI flicker.

**Solution:**
- Separate loading states for initial load vs refresh
- Use `isRefreshing` flag instead of `loading`
- Update data in background without unmounting components

### Challenge 5: Protocol Buffer Parsing
**Problem:** GTFS Realtime uses binary protobuf format, not JSON.

**Solution:** Use `gtfs-realtime-bindings` library:
```javascript
const buffer = await response.arrayBuffer();
const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
  new Uint8Array(buffer)
);
```

## Acknowledgments

- **TransLink** - For providing open GTFS data and API access