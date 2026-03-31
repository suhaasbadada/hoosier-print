import { useEffect, useMemo, useState } from 'react'
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
  const [hasAutoSelectedCampus, setHasAutoSelectedCampus] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km')
  const [showMap, setShowMap] = useState(false)
  const [nearestPage, setNearestPage] = useState(0)
  const [selectedNearestKey, setSelectedNearestKey] = useState<string | null>(null)
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

  const nearestPrinters = useNearestPrinters(filteredPrinters, position, 20)
  const nearestAcrossAllCampuses = useNearestPrinters(printers, position, 1)
  const PAGE_SIZE = 5
  const nearestPageCount = Math.ceil(nearestPrinters.length / PAGE_SIZE)
  const visibleNearest = nearestPrinters.slice(
    nearestPage * PAGE_SIZE,
    (nearestPage + 1) * PAGE_SIZE,
  )

  useEffect(() => {
    if (hasAutoSelectedCampus || selectedCampus !== 'All campuses') {
      return
    }

    const nearestCampus = nearestAcrossAllCampuses[0]?.printer.campus
    if (nearestCampus) {
      setSelectedCampus(nearestCampus)
      setHasAutoSelectedCampus(true)
    }
  }, [hasAutoSelectedCampus, nearestAcrossAllCampuses, selectedCampus])

  useEffect(() => {
    setNearestPage(0)
  }, [nearestPrinters.length])

  useEffect(() => {
    if (!selectedNearestKey) {
      return
    }

    const selectedStillVisible = nearestPrinters.some(
      ({ printer }) => `${printer.building}-${printer.lat}-${printer.lng}` === selectedNearestKey,
    )

    if (!selectedStillVisible) {
      setSelectedNearestKey(null)
    }
  }, [nearestPrinters, selectedNearestKey])

  const printerCount = filteredPrinters.reduce(
    (count, printer) => count + printer.printers.length,
    0,
  )

  const handleSelectCampus = (campus: string) => {
    setHasAutoSelectedCampus(true)
    setSelectedCampus(campus)
  }

  const handleSelectNearest = (printerKey: string) => {
    setSelectedNearestKey(printerKey)
    setShowMap(true)
  }

  return (
    <main className="home-page">
      <div className="home-hero">
        {/* <p className="eyebrow">IU Print Finder</p> */}
        <h1>Locate the nearest campus printers</h1>
        <p>
          Filter by campus, search by building, and let your browser location
          show the closest printers nearby.
        </p>
      </div>

      <div className={`home-grid ${showMap ? '' : 'map-hidden'}`}>
        <Sidebar
          campuses={campuses}
          selectedCampus={selectedCampus}
          onSelectCampus={handleSelectCampus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          distanceUnit={distanceUnit}
          onDistanceUnitChange={setDistanceUnit}
          nearest={visibleNearest}
          nearestTotal={nearestPrinters.length}
          nearestPage={nearestPage}
          nearestPageCount={nearestPageCount}
          onNearestPageChange={setNearestPage}
          locationStatus={status === 'loading' ? 'Locating…' : status === 'granted' ? 'Location active' : status === 'denied' ? 'Permission denied' : status === 'error' ? 'Location error' : 'Waiting for permission'}
          locationError={error}
          onRetryLocation={requestLocation}
          showMap={showMap}
          onToggleMap={() => setShowMap((current) => !current)}
          printerCount={printerCount}
          selectedNearestKey={selectedNearestKey}
          onSelectNearest={handleSelectNearest}
        />

        {showMap ? (
          <section className="map-panel">
            <MapView
              printers={filteredPrinters}
              nearest={nearestPrinters}
              userLocation={position}
              distanceUnit={distanceUnit}
              selectedPrinterKey={selectedNearestKey}
            />
          </section>
        ) : null}
      </div>

      <div className="branding-footer">
        Built by <a href="https://linkedin.com/in/suhaasbadada" target="_blank" rel="noreferrer noopener">Suhaas Badada</a> (and Copilot)
      </div>
    </main>
  )
}
