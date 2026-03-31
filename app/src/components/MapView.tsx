import { useEffect, useMemo, useState } from 'react'
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

function ConfigureTouchInteractions({ isTouchDevice }: { isTouchDevice: boolean }) {
  const map = useMap()

  useEffect(() => {
    const tapHandler = (map as { tap?: { enable: () => void; disable: () => void } }).tap

    if (isTouchDevice) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.scrollWheelZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()
      tapHandler?.disable()
      return
    }

    map.dragging.enable()
    map.touchZoom.enable()
    map.doubleClickZoom.enable()
    map.scrollWheelZoom.enable()
    map.boxZoom.enable()
    map.keyboard.enable()
    tapHandler?.enable()
  }, [isTouchDevice, map])

  return null
}

export default function MapView({ printers, nearest, userLocation, distanceUnit }: MapViewProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    const updateTouchMode = () => {
      const hasTouchPoints = navigator.maxTouchPoints > 0
      const hasTouchEvent = 'ontouchstart' in window
      setIsTouchDevice(coarseQuery.matches || hasTouchPoints || hasTouchEvent)
    }

    updateTouchMode()

    if (typeof coarseQuery.addEventListener === 'function') {
      coarseQuery.addEventListener('change', updateTouchMode)
      return () => coarseQuery.removeEventListener('change', updateTouchMode)
    }

    coarseQuery.addListener(updateTouchMode)
    return () => coarseQuery.removeListener(updateTouchMode)
  }, [])

  const nearestDistanceMap = useMemo(
    () => new Map(nearest.map((item) => [item.printer.building, item.distanceKm])),
    [nearest],
  )

  const bounds = useMemo(() => {
    if (userLocation) {
      const userPoint: [number, number] = [userLocation.lat, userLocation.lng]
      const nearbyPoints: [number, number][] = nearest
        .slice(0, 10)
        .map((item) => [item.printer.lat, item.printer.lng] as [number, number])

      if (!nearbyPoints.length && printers.length > 0) {
        nearbyPoints.push([printers[0].lat, printers[0].lng])
      }

      return [userPoint, ...nearbyPoints]
    }

    return printers
      .slice(0, 30)
      .map((printer) => [printer.lat, printer.lng] as [number, number])
  }, [nearest, printers, userLocation])

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
        dragging={!isTouchDevice}
        touchZoom={!isTouchDevice}
        doubleClickZoom={!isTouchDevice}
        boxZoom={!isTouchDevice}
        keyboard={!isTouchDevice}
        scrollWheelZoom={!isTouchDevice}
        className={isTouchDevice ? 'map-canvas-touch' : undefined}
        style={{ height: '100%', width: '100%' }}
      >
        <ConfigureTouchInteractions isTouchDevice={isTouchDevice} />
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
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${printer.lat},${printer.lng}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="navigate-button"
                  >
                    Navigate
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {userLocation ? (
          <>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={16}
              pathOptions={{ color: '#990000', fillColor: '#990000', fillOpacity: 0.14, weight: 2 }}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={8}
              pathOptions={{ color: '#990000', fillColor: '#990000', fillOpacity: 0.8 }}
            >
              <Popup>Your current location</Popup>
            </CircleMarker>
          </>
        ) : null}
      </MapContainer>
    </div>
  )
}
