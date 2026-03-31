# Hoosier Prints

Hoosier Prints is a campus utility that helps Indiana University students and staff quickly find the nearest available printing locations.

Instead of manually searching building directories, you can:

- detect your current location in the browser,
- auto-focus to your nearest campus,
- see nearby printer buildings ranked by distance,
- open directions instantly in Google Maps,
- and review a built-in guide for mobile/laptop printing at IU.

## What This Tool Does

Hoosier Prints combines campus printer data with geolocation and mapping to answer one question fast:

"Where should I go print right now?"

Core behavior:

- Campus-aware filtering across IU locations
- Search by building, room, or printer name
- Nearest-printer ranking using distance calculations
- Interactive map with highlighted nearby buildings
- One-click navigation links to coordinates
- IU Print Center quick access from the app header

## Typical User Flow

1. Open the app and allow location access.
2. The app estimates your closest campus and filters results.
3. Review nearest buildings in the sidebar with distance + room list.
4. Click an entry to highlight it on the map.
5. Tap Navigate to open turn-by-turn directions.

## Data Coverage

The current dataset includes printer locations for multiple IU campuses, aggregated by building with room/printer details.

Data is prepared from campus CSVs, geocoded, deduplicated, and transformed into a map-ready JSON structure.

## Project Layout

```text
hoosier-print/
├── app/                     # React web app (UI, map, geolocation, ranking)
├── data/
│   ├── raw/                 # Campus CSV sources and geocoded CSVs
│   ├── processed/           # Cache and processed JSON outputs
│   └── scripts/             # Geocoding + transformation scripts
└── requirements.txt         # Python dependencies for data scripts
```

## Tech Stack

- Frontend: React, TypeScript, Vite
- Mapping: Leaflet + React Leaflet + OpenStreetMap tiles
- Routing: React Router
- Analytics/hosting-ready config: Firebase
- Data tools: Python, pandas, Google Maps Geocoding API

## Lightweight Dev Notes

If you need to run the project locally:

```bash
cd app
npm install
npm run dev
```

Data refresh (optional):

```bash
pip install -r requirements.txt
cd data/scripts
python geocode_buildings.py
python csv_to_json.py
```

If data is regenerated, sync `data/processed/buildings_geocoded.json` into `app/src/data/buildings_geocoded.json` before rebuilding.
