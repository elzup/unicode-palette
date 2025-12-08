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
  UNICODE_BLOCKS_DATA,
  BMP_BLOCKS,
  getBlockSize,
  getQuartileChars,
  getBlockByCodepoint,
  getBlockDataByName,
  type UnicodeBlock,
} from './blocks'

export {
  type UnicodeBlockData,
  type UnicodeBlocksData,
  type CodepointRange,
  parseUnicodeBlocksData,
  safeParseUnicodeBlocksData,
} from './schema'
