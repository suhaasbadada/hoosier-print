export type PrinterDetail = {
  room: string
  printer_name: string | null
}

export type Printer = {
  building: string
  campus: string
  lat: number
  lng: number
  printers: PrinterDetail[]
}

export type RawBuilding = {
  building: string
  campus: string
  lat: number
  lng: number
  printers?: Array<{ room: string | number; printer_name: string | null }>
}

export type BuildingsJson = {
  buildings: RawBuilding[]
}
