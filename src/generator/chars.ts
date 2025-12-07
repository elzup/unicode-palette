import type { CharCategory, GridOptions } from '../types'
import { getCategory, escapeXml, resolveConfig, skipSurrogate } from './core'

export type CharInfo = {
  codepoint: number
  char: string
  category: CharCategory
}

export type GridData = {
  chars: CharInfo[][]
  config: {
    cols: number
    rows: number
    cellSize: number
    width: number
    height: number
  }
}

export function generateChars(options: GridOptions = {}): CharInfo[] {
  const config = resolveConfig(options)
  const { cols, rows, startCodepoint } = config
  const total = cols * rows

  const chars: CharInfo[] = []
  let codepoint = startCodepoint

  for (let i = 0; i < total; i++) {
    codepoint = skipSurrogate(codepoint)
    const char = String.fromCodePoint(codepoint)
    const category = getCategory(char)

    chars.push({ codepoint, char, category })
    codepoint++
  }

  return chars
}

export function generateGrid(options: GridOptions = {}): GridData {
  const config = resolveConfig(options)
  const { cols, rows, cellSize } = config

  const allChars = generateChars(options)
  const grid: CharInfo[][] = []

  for (let row = 0; row < rows; row++) {
    const rowChars: CharInfo[] = []

    for (let col = 0; col < cols; col++) {
      const index = row * cols + col

      if (index < allChars.length) {
        rowChars.push(allChars[index])
      }
    }
    grid.push(rowChars)
  }

  return {
    chars: grid,
    config: {
      cols,
      rows,
      cellSize,
      width: cols * cellSize,
      height: rows * cellSize,
    },
  }
}

export function generateSvgString(options: GridOptions = {}): string {
  const config = resolveConfig(options)
  const { cols, rows, cellSize, fontPath } = config
  const grid = generateGrid(options)

  const textLines: string[] = []

  for (let row = 0; row < grid.chars.length; row++) {
    const rowChars = grid.chars[row]
    const xPositions: number[] = []
    let lineChars = ''

    for (let col = 0; col < rowChars.length; col++) {
      const info = rowChars[col]

      xPositions.push(col * cellSize + cellSize / 2)

      if (info.category === 'printable') {
        lineChars += escapeXml(info.char)
      } else {
        lineChars += ' '
      }
    }

    if (lineChars.length > 0) {
      const y = row * cellSize + cellSize * 0.8

      textLines.push(
        `<text x="${xPositions.join(' ')}" y="${y}">${lineChars}</text>`
      )
    }
  }

  const width = cols * cellSize
  const height = rows * cellSize

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    @font-face {
      font-family: 'Unifont';
      src: url('${fontPath}') format('opentype');
    }
    text {
      font-family: 'Unifont', monospace;
      font-size: ${Math.floor(cellSize * 0.75)}px;
      text-anchor: middle;
    }
  </style>
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${textLines.join('\n  ')}
</svg>`

  return svg
}
