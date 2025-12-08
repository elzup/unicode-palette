import { writeFileSync, mkdirSync } from 'node:fs'
import { generateScriptTilesSvg } from './script-tiles'

const OUTPUT_DIR = 'output'
const OUTPUT_FILE = `${OUTPUT_DIR}/script-tiles.svg`

mkdirSync(OUTPUT_DIR, { recursive: true })

const svg = generateScriptTilesSvg({
  cellSize: 32,
  cols: 7,
})

writeFileSync(OUTPUT_FILE, svg)
console.log(`Generated: ${OUTPUT_FILE}`)
