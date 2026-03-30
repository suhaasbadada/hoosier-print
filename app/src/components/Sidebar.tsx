import { formatDistance, type DistanceUnit } from '../utils/format'
import type { NearestPrinter } from '../hooks/useNearestPrinters'

type SidebarProps = {
  campuses: string[]
  selectedCampus: string
  onSelectCampus: (campus: string) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  distanceUnit: DistanceUnit
  onDistanceUnitChange: (unit: DistanceUnit) => void
  nearest: NearestPrinter[]
  nearestTotal: number
  nearestPage: number
  nearestPageCount: number
  onNearestPageChange: (page: number) => void
  locationStatus: string
  locationError?: string
  onRetryLocation: () => void
  showMap: boolean
  onToggleMap: () => void
  printerCount: number
}

export default function Sidebar({
  campuses,
  selectedCampus,
  onSelectCampus,
  searchTerm,
  onSearchChange,
  distanceUnit,
  onDistanceUnitChange,
  nearest,
  nearestTotal,
  nearestPage,
  nearestPageCount,
  onNearestPageChange,
  locationStatus,
  locationError,
  onRetryLocation,
  showMap,
  onToggleMap,
  printerCount,
}: SidebarProps) {
  const isMapLocked = showMap

  return (
    <aside className="sidebar">
      <div className={`sidebar-card row-group${isMapLocked ? ' map-locked' : ''}`}>
        <div className="filter-group">
          <p className="eyebrow">Campus</p>
          <label htmlFor="campus-select">Select your campus</label>
          <select
            id="campus-select"
            value={selectedCampus}
            onChange={(event) => onSelectCampus(event.target.value)}
          >
            {campuses.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <p className="eyebrow">Units</p>
          <label htmlFor="distance-unit-select">Display distance in</label>
          <select
            id="distance-unit-select"
            value={distanceUnit}
            onChange={(event) => onDistanceUnitChange(event.target.value as DistanceUnit)}
          >
            <option value="km">Kilometers</option>
            <option value="mi">Miles</option>
          </select>
        </div>

        <div className="retry-control">
          <button
            type="button"
            className="control-button"
            onClick={onRetryLocation}
          >
            Retry location
          </button>
          <button
            type="button"
            className="control-button"
            onClick={onToggleMap}
          >
            {showMap ? 'Hide map' : 'Show map'}
          </button>
        </div>
      </div>

      <div className="sidebar-card">
        <p className="eyebrow">Search</p>
        <label htmlFor="printer-search">Printer name</label>
        <input
          id="printer-search"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by printer or building"
        />
      </div>

      <div className="sidebar-card status-card">
        <p className="eyebrow">Geolocation</p>
        <div className="status-line">{locationStatus}</div>
        {locationError ? <div className="status-error">{locationError}</div> : null}
      </div>

      <div className="sidebar-card">
        <div className="sidebar-header">
          <p className="eyebrow">Results</p>
          <span>{printerCount} printers</span>
        </div>
        <h2>Nearest printers</h2>
        {nearestTotal > 0 ? (
          <p className="results-note">
            Showing {nearest.length} of {nearestTotal} nearest buildings
          </p>
        ) : null}
        {nearest.length === 0 ? (
          <p className="empty-state">
            Allow location access and choose a campus to see nearby printers.
          </p>
        ) : (
          <>
            <ul className="nearest-list">
              {nearest.map(({ printer, distanceKm }) => (
                <li key={`${printer.building}-${printer.lat}-${printer.lng}`}>
                  <span className="printer-count-pill">
                    {printer.printers.length}
                  </span>
                  <strong>{printer.building}</strong>
                  <span>{printer.campus}</span>
                  <span>{formatDistance(distanceKm, distanceUnit)}</span>
                  {printer.printers.length > 0 ? (
                    <small>
                      Rooms: {printer.printers.map((entry) => entry.room).join(', ')}
                    </small>
                  ) : null}
                  <a
                    className="navigate-icon"
                    href={`https://www.google.com/maps/search/?api=1&query=${printer.lat},${printer.lng}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Navigate"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        fill="#ffffff"
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      />
                      <circle cx="12" cy="9" r="2.5" fill="#DB4437" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
            {nearestPageCount > 1 ? (
              <div className="pagination-controls">
                <button
                  type="button"
                  disabled={nearestPage === 0}
                  onClick={() => onNearestPageChange(nearestPage - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {nearestPage + 1} of {nearestPageCount}
                </span>
                <button
                  type="button"
                  disabled={nearestPage === nearestPageCount - 1}
                  onClick={() => onNearestPageChange(nearestPage + 1)}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </aside>
  )
}
