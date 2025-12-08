// Unicode block data loaded from JSON (single source of truth)
import blocksData from '../../data/unicode-blocks.json'
import type { UnicodeBlockData, UnicodeBlocksData } from './schema'

// Re-export the full data
export const UNICODE_BLOCKS_DATA: UnicodeBlocksData = blocksData as UnicodeBlocksData

// Simplified block type for rendering (compatible with old API)
export type UnicodeBlock = {
  name: string
  displayName: string
  start: number
  end: number
}

// Convert to simplified format
function toUnicodeBlock(block: UnicodeBlockData): UnicodeBlock {
  return {
    name: block.name,
    displayName: block.displayName,
    start: block.blockStart,
    end: block.blockEnd,
  }
}

// All Unicode blocks (338 blocks from Unicode 16.0.0)
export const UNICODE_BLOCKS: UnicodeBlock[] = UNICODE_BLOCKS_DATA.blocks.map(toUnicodeBlock)

// BMP blocks only (U+0000 to U+FFFF)
export const BMP_BLOCKS: UnicodeBlock[] = UNICODE_BLOCKS.filter((b) => b.start <= 0xffff)

// Utility functions
export function getBlockSize(block: UnicodeBlock): number {
  return block.end - block.start + 1
}

export function getQuartileChars(block: UnicodeBlock): number[] {
  const size = getBlockSize(block)
  const quartileSize = Math.floor(size / 4)
  return [
    block.start,
    block.start + quartileSize,
    block.start + quartileSize * 2,
    block.start + quartileSize * 3,
  ]
}

export function getBlockByCodepoint(codepoint: number): UnicodeBlock | undefined {
  return UNICODE_BLOCKS.find((b) => codepoint >= b.start && codepoint <= b.end)
}

// Get full block data with ranges (for advanced usage)
export function getBlockDataByName(name: string): UnicodeBlockData | undefined {
  return UNICODE_BLOCKS_DATA.blocks.find((b) => b.name === name)
}
