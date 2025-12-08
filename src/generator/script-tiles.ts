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

  // 4x1 layout: 4 characters horizontally
  const tileWidth = cellSize * 4
  const tileHeight = cellSize
  const tilePadding = 4
  const labelHeight = 12
  const totalTileHeight = tileHeight + labelHeight + tilePadding

  const rows = Math.ceil(tileData.length / cols)
  const width = cols * (tileWidth + tilePadding)
  const height = rows * totalTileHeight

  const tiles: string[] = []

  tileData.forEach((tile, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = col * (tileWidth + tilePadding)
    const y = row * totalTileHeight

    // Background
    tiles.push(`<rect x="${x}" y="${y}" width="${tileWidth}" height="${tileHeight}" fill="#f0f0f0" stroke="#ccc" stroke-width="0.5"/>`)

    // 4x1 characters (horizontal layout)
    tile.chars.forEach((charInfo, i) => {
      const cx = x + i * cellSize + cellSize / 2
      const cy = y + cellSize * 0.75

      if (charInfo.printable) {
        tiles.push(`<text x="${cx}" y="${cy}" class="char">${escapeXml(charInfo.char)}</text>`)
      } else {
        // Show codepoint for non-printable
        const hex = charInfo.codepoint.toString(16).toUpperCase().padStart(4, '0')
        tiles.push(`<text x="${cx}" y="${cy}" class="hex">${hex}</text>`)
      }
    })

    // Label (centered under tile)
    const labelY = y + tileHeight + labelHeight - 2
    tiles.push(`<text x="${x + tileWidth / 2}" y="${labelY}" class="label">${escapeXml(tile.block.displayName)}</text>`)
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
