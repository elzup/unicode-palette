import { describe, it, expect } from 'vitest'
import { parseUnicodeBlocksData, safeParseUnicodeBlocksData } from '../core/schema'
import { UNICODE_BLOCKS_DATA } from '../core/blocks'

describe('parseUnicodeBlocksData', () => {
  it('should parse valid data', () => {
    const data = parseUnicodeBlocksData(UNICODE_BLOCKS_DATA)
    expect(data.version).toBeDefined()
    expect(data.blocks).toBeDefined()
  })

  it('should throw on invalid data', () => {
    expect(() => parseUnicodeBlocksData({})).toThrow()
    expect(() => parseUnicodeBlocksData({ blocks: 'invalid' })).toThrow()
  })

  it('snapshot: parsed data structure', () => {
    const data = parseUnicodeBlocksData(UNICODE_BLOCKS_DATA)
    expect({
      version: data.version,
      totalBlocks: data.totalBlocks,
      bmpBlocks: data.bmpBlocks,
      firstBlock: data.blocks[0],
    }).toMatchSnapshot()
  })
})

describe('safeParseUnicodeBlocksData', () => {
  it('should return success for valid data', () => {
    const result = safeParseUnicodeBlocksData(UNICODE_BLOCKS_DATA)
    expect(result.success).toBe(true)
  })

  it('should return error for invalid data', () => {
    const result = safeParseUnicodeBlocksData({})
    expect(result.success).toBe(false)
  })

  it('should return error for partial data', () => {
    const result = safeParseUnicodeBlocksData({
      version: '1.0',
      blocks: [],
    })
    expect(result.success).toBe(false)
  })
})
