import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error'

export type GeoPosition = {
  lat: number
  lng: number
} | null

export type GeolocationState = {
  position: GeoPosition
  status: GeolocationStatus
  error?: string
  requestLocation: () => void
}

const GeolocationContext = createContext<GeolocationState | undefined>(undefined)

const getBrowserLocation = (): Promise<GeoPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      },
    )
  })

const useGeolocationState = (): GeolocationState => {
  const [position, setPosition] = useState<GeoPosition>(null)
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [error, setError] = useState<string>()

  const requestLocation = useCallback(() => {
    setStatus('loading')
    setError(undefined)

    getBrowserLocation()
      .then((location) => {
        setPosition(location)
        setStatus('granted')
      })
      .catch((rawError) => {
        const error = rawError as GeolocationPositionError | Error

        if ('code' in error && error.code === 1) {
          setStatus('denied')
          setError('Location permission denied.')
        } else {
          setStatus('error')
          setError(error.message || 'Unable to determine location.')
        }
      })
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  return useMemo(
    () => ({
      position,
      status,
      error,
      requestLocation,
    }),
    [position, status, error, requestLocation],
  )
}

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const state = useGeolocationState()
  return (
    <GeolocationContext.Provider value={state}>
      {children}
    </GeolocationContext.Provider>
  )
}

export function useGeolocationContext(): GeolocationState {
  const context = useContext(GeolocationContext)
  if (!context) {
    throw new Error('useGeolocationContext must be used within a GeolocationProvider')
  }
  return context
}
