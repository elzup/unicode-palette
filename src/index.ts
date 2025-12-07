export { add } from './unit'

// Types
export type {
  CharCategory,
  GridOptions,
  GridConfig,
  CodePoint,
} from './types'
export { DEFAULT_CONFIG } from './types'

// Core utilities (browser compatible)
export {
  getCategory,
  escapeXml,
  skipSurrogate,
  CATEGORY_COLORS,
} from './generator/core'

// Character generation (browser compatible)
export type { CharInfo, GridData } from './generator/chars'
export {
  generateChars,
  generateGrid,
  generateSvgString,
} from './generator/chars'

// Alias
export { generateSvgString as renderSvg } from './generator/chars'
