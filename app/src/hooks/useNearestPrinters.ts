import { useMemo } from 'react'
import type { Printer } from '../types/printer'
import { haversineDistance, type LatLng } from '../utils/distance'

export type NearestPrinter = {
  printer: Printer
  distanceKm: number
}

export function useNearestPrinters(
  printers: Printer[],
  userPosition: LatLng | null,
  limit = 5,
): NearestPrinter[] {
  return useMemo(() => {
    if (!userPosition || printers.length === 0) {
      return []
    }

    const sorted = printers
      .map((printer) => ({
        printer,
        distanceKm: haversineDistance(userPosition, printer),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)

    const uniqueByBuilding: NearestPrinter[] = []
    const seenBuildings = new Set<string>()

    for (const candidate of sorted) {
      if (!seenBuildings.has(candidate.printer.building)) {
        seenBuildings.add(candidate.printer.building)
        uniqueByBuilding.push(candidate)
      }
      if (uniqueByBuilding.length >= limit) {
        break
      }
    }

    return uniqueByBuilding
  }, [printers, userPosition, limit])
}
