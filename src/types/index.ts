export type { CodePoint } from './CodePoint'

export type CharCategory =
  | 'printable'
  | 'control'
  | 'surrogate'
  | 'unassigned'
  | 'private'
  | 'noGlyph'

export type GridOptions = {
  cols?: number
  rows?: number
  cellSize?: number
  startCodepoint?: number
  fontPath?: string
  showBackground?: boolean
}

export type GridConfig = Required<GridOptions>

export const DEFAULT_CONFIG: GridConfig = {
  cols: 64,
  rows: 104,
  cellSize: 16,
  startCodepoint: 0x0000,
  fontPath: './fonts/unifont.otf',
  showBackground: false,
}
