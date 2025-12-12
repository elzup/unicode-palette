import { describe, it, expect } from 'vitest'
import {
  UNICODE_BLOCKS,
  BMP_BLOCKS,
  getBlockSize,
  getQuartileChars,
  getBlockByCodepoint,
  getBlockDataByName,
} from '../core/blocks'

describe('UNICODE_BLOCKS', () => {
  it('should have blocks defined', () => {
    expect(UNICODE_BLOCKS.length).toBeGreaterThan(0)
  })

  it('snapshot: first 10 blocks', () => {
    expect(UNICODE_BLOCKS.slice(0, 10)).toMatchSnapshot()
  })

  it('snapshot: block count', () => {
    expect({
      totalBlocks: UNICODE_BLOCKS.length,
      bmpBlocks: BMP_BLOCKS.length,
    }).toMatchSnapshot()
  })
})

describe('BMP_BLOCKS', () => {
  it('should only contain blocks in BMP range', () => {
    for (const block of BMP_BLOCKS) {
      expect(block.start).toBeLessThanOrEqual(0xffff)
    }
  })

  it('snapshot: first 10 BMP blocks', () => {
    expect(BMP_BLOCKS.slice(0, 10)).toMatchSnapshot()
  })
})

describe('getBlockSize', () => {
  it('should calculate block size correctly', () => {
    const basicLatin = UNICODE_BLOCKS.find((b) => b.name === 'Basic_Latin')!
    expect(getBlockSize(basicLatin)).toBe(128) // 0x0000-0x007F = 128
  })

  it('snapshot: sizes of first 10 blocks', () => {
    const results = UNICODE_BLOCKS.slice(0, 10).map((b) => ({
      name: b.name,
      size: getBlockSize(b),
    }))
    expect(results).toMatchSnapshot()
  })
})

describe('getQuartileChars', () => {
  it('should return 4 codepoints', () => {
    const basicLatin = UNICODE_BLOCKS.find((b) => b.name === 'Basic_Latin')!
    const quartiles = getQuartileChars(basicLatin)
    expect(quartiles).toHaveLength(4)
  })

  it('snapshot: quartile chars for common blocks', () => {
    const blockNames = ['Basic_Latin', 'Hiragana', 'Katakana', 'CJK_Unified_Ideographs']
    const results = blockNames.map((name) => {
      const block = UNICODE_BLOCKS.find((b) => b.name === name)
      if (!block) return { name, quartiles: null }
      return {
        name,
        quartiles: getQuartileChars(block).map((cp) => cp.toString(16).padStart(4, '0')),
      }
    })
    expect(results).toMatchSnapshot()
  })
})

describe('getBlockByCodepoint', () => {
  it('should find block for Basic Latin', () => {
    const block = getBlockByCodepoint(0x0041) // 'A'
    expect(block?.name).toBe('Basic_Latin')
  })

  it('should find block for Hiragana', () => {
    const block = getBlockByCodepoint(0x3042) // 'あ'
    expect(block?.name).toBe('Hiragana')
  })

  it('should return undefined for invalid codepoint', () => {
    const block = getBlockByCodepoint(0x10ffff + 1)
    expect(block).toBeUndefined()
  })

  it('snapshot: block lookup results', () => {
    const codepoints = [0x0041, 0x3042, 0x30a2, 0x4e00, 0x1f600, 0xe000]
    const results = codepoints.map((cp) => {
      const block = getBlockByCodepoint(cp)
      return {
        codepoint: cp.toString(16).padStart(4, '0'),
        blockName: block?.name ?? null,
      }
    })
    expect(results).toMatchSnapshot()
  })
})

describe('getBlockDataByName', () => {
  it('should find block data by name', () => {
    const data = getBlockDataByName('Basic_Latin')
    expect(data).toBeDefined()
    expect(data?.name).toBe('Basic_Latin')
  })

  it('should return undefined for unknown name', () => {
    const data = getBlockDataByName('Unknown Block')
    expect(data).toBeUndefined()
  })

  it('snapshot: block data for Basic Latin', () => {
    const data = getBlockDataByName('Basic_Latin')
    expect(data).toMatchSnapshot()
  })
})
