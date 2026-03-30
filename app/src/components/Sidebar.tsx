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
  locationStatus: string
  locationError?: string
  onRetryLocation: () => void
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
  locationStatus,
  locationError,
  onRetryLocation,
  printerCount,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-card row-group">
        <div>
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

        <div>
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
        <button type="button" onClick={onRetryLocation}>
          Retry location
        </button>
      </div>

      <div className="sidebar-card">
        <div className="sidebar-header">
          <p className="eyebrow">Results</p>
          <span>{printerCount} printers</span>
        </div>
        <h2>Nearest printers</h2>
        {nearest.length === 0 ? (
          <p className="empty-state">
            Allow location access and choose a campus to see nearby printers.
          </p>
        ) : (
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
