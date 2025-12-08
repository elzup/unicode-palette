import * as fs from 'fs'
import type { GridOptions } from '../types'
import { resolveConfig } from '../core'
import { generateSvgString } from './chars'

export { generateSvgString as renderSvg }

export function renderSvgToFile(
  outPath: string,
  options: GridOptions = {}
): void {
  const config = resolveConfig(options)
  const svg = generateSvgString(options)
  const dir = outPath.substring(0, outPath.lastIndexOf('/'))

  if (dir !== '') {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(outPath, svg)

  const { cols, rows, cellSize } = config

  console.log(`Generated: ${outPath}`)
  console.log(`Size: ${cols * cellSize} x ${rows * cellSize} px`)
  console.log(`Chars: ${cols * rows}`)
}

// Run as main module
const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  renderSvgToFile('./output/unicode-sample-10pct.svg')
}
