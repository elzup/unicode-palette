// Core Unicode utilities - browser compatible

export {
  getCategory,
  escapeXml,
  CATEGORY_COLORS,
  resolveConfig,
  skipSurrogate,
} from './category'

export {
  UNICODE_BLOCKS,
  BMP_BLOCKS,
  getBlockSize,
  getQuartileChars,
  getBlockByCodepoint,
  type UnicodeBlock,
} from './blocks.generated'
