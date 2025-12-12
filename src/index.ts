// Types
export type { CharCategory, GridOptions, GridConfig, CodePoint } from './types'
export { DEFAULT_CONFIG } from './types'

// Core utilities (browser compatible)
export {
  getCategory,
  escapeXml,
  skipSurrogate,
  CATEGORY_COLORS,
  resolveConfig,
  // Unicode blocks
  UNICODE_BLOCKS,
  BMP_BLOCKS,
  getBlockSize,
  getQuartileChars,
  getBlockByCodepoint,
  type UnicodeBlock,
} from './core'

// Render utilities (browser compatible)
export type { CharInfo, GridData, TileOptions, TileData } from './render'
export {
  generateChars,
  generateGrid,
  generateSvgString,
  generateTileData,
  generateScriptTilesSvg,
} from './render'

// Alias
export { generateSvgString as renderSvg } from './render'
