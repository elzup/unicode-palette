import {
  UNICODE_BLOCKS,
  getQuartileChars,
  getCategory,
  escapeXml,
  type UnicodeBlock,
} from '../core'

export type TileOptions = {
  cellSize?: number
  cols?: number // number of tiles per row
  fontPath?: string
  blocks?: UnicodeBlock[]
}

const DEFAULT_TILE_OPTIONS = {
  cellSize: 32,
  cols: 8,
  fontPath: './fonts/unifont.otf',
}

export type TileData = {
  block: UnicodeBlock
  chars: { codepoint: number; char: string; printable: boolean }[]
}

export function generateTileData(blocks: UnicodeBlock[] = UNICODE_BLOCKS): TileData[] {
  return blocks.map((block) => {
    const codepoints = getQuartileChars(block)
    const chars = codepoints.map((cp) => {
      const char = String.fromCodePoint(cp)
      const category = getCategory(char)
      return {
        codepoint: cp,
        char,
        printable: category === 'printable',
      }
    })
    return { block, chars }
  })
}

export function generateScriptTilesSvg(options: TileOptions = {}): string {
  const { cellSize, cols, fontPath, blocks } = { ...DEFAULT_TILE_OPTIONS, ...options }
  const tileData = generateTileData(blocks)

  const tileSize = cellSize * 2 // 2x2 tile
  const tilePadding = 4
  const labelHeight = 14
  const totalTileHeight = tileSize + labelHeight + tilePadding

  const rows = Math.ceil(tileData.length / cols)
  const width = cols * (tileSize + tilePadding)
  const height = rows * totalTileHeight

  const tiles: string[] = []

  tileData.forEach((tile, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = col * (tileSize + tilePadding)
    const y = row * totalTileHeight

    // Background
    tiles.push(`<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="#f0f0f0" stroke="#ccc" stroke-width="0.5"/>`)

    // 2x2 characters
    tile.chars.forEach((charInfo, i) => {
      const cx = x + (i % 2) * cellSize + cellSize / 2
      const cy = y + Math.floor(i / 2) * cellSize + cellSize * 0.75

      if (charInfo.printable) {
        tiles.push(`<text x="${cx}" y="${cy}" class="char">${escapeXml(charInfo.char)}</text>`)
      } else {
        // Show codepoint for non-printable
        const hex = charInfo.codepoint.toString(16).toUpperCase().padStart(4, '0')
        tiles.push(`<text x="${cx}" y="${cy}" class="hex">${hex}</text>`)
      }
    })

    // Label
    const labelY = y + tileSize + labelHeight - 2
    tiles.push(`<text x="${x + tileSize / 2}" y="${labelY}" class="label">${escapeXml(tile.block.name)}</text>`)
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    @font-face {
      font-family: 'Unifont';
      src: url('${fontPath}') format('opentype');
    }
    .char {
      font-family: 'Unifont', monospace;
      font-size: ${Math.floor(cellSize * 0.7)}px;
      text-anchor: middle;
    }
    .hex {
      font-family: monospace;
      font-size: ${Math.floor(cellSize * 0.25)}px;
      text-anchor: middle;
      fill: #999;
    }
    .label {
      font-family: sans-serif;
      font-size: 8px;
      text-anchor: middle;
      fill: #666;
    }
  </style>
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${tiles.join('\n  ')}
</svg>`
}
