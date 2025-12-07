import * as fs from 'fs'
import { createCanvas, registerFont } from 'canvas'
import type { CharCategory, GridOptions } from '../types'
import {
  getCategory,
  resolveConfig,
  skipSurrogate,
  CATEGORY_COLORS,
} from './core'

export type RenderStats = Record<CharCategory, number>

function ensureFont(fontPath: string): void {
  if (!fs.existsSync(fontPath)) {
    console.error('Error: Font file not found.')
    console.error('')
    console.error('Please run the setup script first:')
    console.error('  ./scripts/setup-font.sh')
    console.error('')
    console.error('Or download manually from:')
    console.error('  https://unifoundry.com/pub/unifont/')
    process.exit(1)
  }
  registerFont(fontPath, { family: 'Unifont' })
}

export function renderPng(options: GridOptions = {}): {
  buffer: Buffer
  stats: RenderStats
} {
  const config = resolveConfig(options)
  const { cols, rows, cellSize, startCodepoint, fontPath, showBackground } =
    config
  const total = cols * rows

  ensureFont(fontPath)

  const width = cols * cellSize
  const height = rows * cellSize

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.font = `${Math.floor(cellSize * 0.75)}px Unifont`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let codepoint = startCodepoint

  const stats: RenderStats = {
    printable: 0,
    control: 0,
    surrogate: 0,
    unassigned: 0,
    private: 0,
    noGlyph: 0,
  }

  const notdefWidth = ctx.measureText('\uFFFF').width

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      codepoint = skipSurrogate(codepoint)

      const char = String.fromCodePoint(codepoint)
      const category = getCategory(char)

      stats[category]++

      const x = col * cellSize
      const y = row * cellSize

      if (showBackground) {
        ctx.fillStyle = CATEGORY_COLORS[category]
        ctx.fillRect(x, y, cellSize, cellSize)
      }

      if (category === 'printable') {
        const charWidth = ctx.measureText(char).width

        if (Math.abs(charWidth - notdefWidth) < 0.1) {
          stats.printable--
          stats.noGlyph++
          if (showBackground) {
            ctx.fillStyle = CATEGORY_COLORS.noGlyph
            ctx.fillRect(x, y, cellSize, cellSize)
          }
        } else {
          ctx.fillStyle = '#000000'
          ctx.fillText(char, x + cellSize / 2, y + cellSize / 2)
        }
      }

      codepoint++
      if (codepoint - startCodepoint >= total) break
    }
    if (codepoint - startCodepoint >= total) break
  }

  const buffer = canvas.toBuffer('image/png')

  return { buffer, stats }
}

export function renderPngToFile(
  outPath: string,
  options: GridOptions = {}
): RenderStats {
  const config = resolveConfig(options)
  const { buffer, stats } = renderPng(options)

  const dir = outPath.substring(0, outPath.lastIndexOf('/'))

  if (dir !== '') {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(outPath, new Uint8Array(buffer))

  const { cols, rows, cellSize, startCodepoint } = config
  const total = cols * rows

  console.log(`Generated: ${outPath}`)
  console.log(`Size: ${cols * cellSize} x ${rows * cellSize} px`)
  const endCodepoint = startCodepoint + total - 1

  const startHex = startCodepoint.toString(16).padStart(4, '0')
  const endHex = endCodepoint.toString(16).padStart(4, '0')

  console.log(`Range: U+${startHex} - U+${endHex}`)
  console.log(`Stats:`, stats)

  return stats
}

if (require.main === module) {
  renderPngToFile('./output/unicode-sample-10pct.png', { showBackground: true })
}
