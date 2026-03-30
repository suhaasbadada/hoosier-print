import { useMemo, useState } from 'react'
import rawData from '../data/buildings_geocoded.json'
import { useGeolocationContext } from '../hooks/useGeolocation'
import { useNearestPrinters } from '../hooks/useNearestPrinters'
import MapView from '../components/MapView'
import Sidebar from '../components/Sidebar'
import type { DistanceUnit } from '../utils/format'
import type { Printer, RawBuilding } from '../types/printer'

function normalizeBuildings(raw: { buildings: RawBuilding[] }): Printer[] {
  return raw.buildings.map((item) => ({
    building: item.building,
    campus: item.campus,
    lat: item.lat,
    lng: item.lng,
    printers: item.printers?.map((printer) => ({
      room: String(printer.room),
      printer_name: printer.printer_name ?? null,
    })) ?? [],
  }))
}

export default function Home() {
  const [selectedCampus, setSelectedCampus] = useState('All campuses')
  const [searchTerm, setSearchTerm] = useState('')
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km')
  const [showMap, setShowMap] = useState(false)
  const { position, status, error, requestLocation } = useGeolocationContext()

  const printers = useMemo(() => normalizeBuildings(rawData), [])
  const campuses = useMemo(
    () => ['All campuses', ...Array.from(new Set(printers.map((printer) => printer.campus))).sort()],
    [printers],
  )

  const filteredPrinters = useMemo(
    () =>
      printers.filter((printer) => {
        const matchesCampus =
          selectedCampus === 'All campuses' || printer.campus === selectedCampus
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          printer.building.toLowerCase().includes(searchLower) ||
          printer.printers.some(
            (entry) =>
              entry.room.toLowerCase().includes(searchLower) ||
              (entry.printer_name?.toLowerCase().includes(searchLower) ?? false),
          )
        return matchesCampus && matchesSearch
      }),
    [printers, selectedCampus, searchTerm],
  )

  const nearestPrinters = useNearestPrinters(filteredPrinters, position)
  const printerCount = filteredPrinters.reduce(
    (count, printer) => count + printer.printers.length,
    0,
  )

  return (
    <main className="home-page">
      <div className="home-hero">
        {/* <p className="eyebrow">IU Print Finder</p> */}
        <h1>Locate the nearest campus printers</h1>
        <p>
          Filter by campus, search by building, and let your browser location
          show the closest printers nearby.
        </p>
        <button
          type="button"
          className="hero-toggle-map"
          onClick={() => setShowMap((current) => !current)}
        >
          {showMap ? 'Hide map' : 'Show map'}
        </button>
      </div>

      <div className={`home-grid ${showMap ? '' : 'map-hidden'}`}>
        <Sidebar
          campuses={campuses}
          selectedCampus={selectedCampus}
          onSelectCampus={setSelectedCampus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          distanceUnit={distanceUnit}
          onDistanceUnitChange={setDistanceUnit}
          nearest={nearestPrinters}
          locationStatus={status === 'loading' ? 'Locating…' : status === 'granted' ? 'Location active' : status === 'denied' ? 'Permission denied' : status === 'error' ? 'Location error' : 'Waiting for permission'}
          locationError={error}
          onRetryLocation={requestLocation}
          printerCount={printerCount}
        />

        {showMap ? (
          <section className="map-panel">
            <MapView
              printers={filteredPrinters}
              nearest={nearestPrinters}
              userLocation={position}
              distanceUnit={distanceUnit}
            />
          </section>
        ) : null}
      </div>
    </main>
  )
}
