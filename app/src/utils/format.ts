export type DistanceUnit = 'km' | 'mi'

export function formatDistance(distanceKm: number, unit: DistanceUnit = 'km'): string {
  if (unit === 'mi') {
    const distanceMi = distanceKm * 0.621371
    if (distanceMi < 0.5) {
      return `${Math.round(distanceMi * 5280)} ft`
    }
    return `${distanceMi.toFixed(1)} mi`
  }

  if (distanceKm < 0.5) {
    return `${Math.round(distanceKm * 1000)} m`
  }

  return `${distanceKm.toFixed(1)} km`
}
