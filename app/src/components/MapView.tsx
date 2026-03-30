import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import { icon } from 'leaflet'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import type { Printer } from '../types/printer'
import type { NearestPrinter } from '../hooks/useNearestPrinters'
import { formatDistance, type DistanceUnit } from '../utils/format'

const defaultIcon = icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const highlightIcon = icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  className: 'marker-highlight',
})

type MapViewProps = {
  printers: Printer[]
  nearest: NearestPrinter[]
  userLocation: { lat: number; lng: number } | null
  distanceUnit: DistanceUnit
}

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (!bounds.length) {
      return
    }

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 16,
    })
  }, [bounds, map])

  return null
}

export default function MapView({ printers, nearest, userLocation, distanceUnit }: MapViewProps) {
  const nearestDistanceMap = useMemo(
    () => new Map(nearest.map((item) => [item.printer.building, item.distanceKm])),
    [nearest],
  )

  const bounds = useMemo(() => {
    const points: [number, number][] = printers.map((printer) => [printer.lat, printer.lng])
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng])
    }
    return points
  }, [printers, userLocation])

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : printers.length
    ? [printers[0].lat, printers[0].lng]
    : [39.1653, -86.5264]

  return (
    <div className="map-view">
      <MapContainer
        center={center}
        zoom={13}
        minZoom={4}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bounds.length > 0 ? <FitBounds bounds={bounds} /> : null}

        {printers.map((printer) => {
          const position: [number, number] = [printer.lat, printer.lng]
          const isNearest = nearestDistanceMap.has(printer.building)
          const distance = nearestDistanceMap.get(printer.building)

          return (
            <Marker
              key={`${printer.building}-${printer.lat}-${printer.lng}`}
              position={position}
              icon={isNearest ? highlightIcon : defaultIcon}
            >
              <Popup>
                <strong>{printer.building}</strong>
                <div>Campus: {printer.campus}</div>
                <div>{printer.printers.length} printers available</div>
                {printer.printers.length > 0 ? (
                  <div>Rooms: {printer.printers.map((entry) => entry.room).join(', ')}</div>
                ) : null}
                {typeof distance === 'number' ? (
                  <div>Distance: {formatDistance(distance, distanceUnit)}</div>
                ) : null}
              </Popup>
            </Marker>
          )
        })}

        {userLocation ? (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{ color: '#990000', fillColor: '#990000', fillOpacity: 0.75 }}
          >
            <Popup>Your current location</Popup>
          </CircleMarker>
        ) : null}
      </MapContainer>
    </div>
  )
}
