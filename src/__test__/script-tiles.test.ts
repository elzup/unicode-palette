import { describe, it, expect } from 'vitest'
import { generateTileData, generateScriptTilesSvg } from '../render/script-tiles'
import { UNICODE_BLOCKS, BMP_BLOCKS } from '../core/blocks'

describe('generateTileData', () => {
  it('should generate tile data for BMP blocks by default', () => {
    const tiles = generateTileData()
    expect(tiles.length).toBe(BMP_BLOCKS.length)
  })

  it('should generate tile data for all blocks when bmpOnly is false', () => {
    const tiles = generateTileData(undefined, false)
    expect(tiles.length).toBe(UNICODE_BLOCKS.length)
  })

  it('should generate tile data for specific blocks', () => {
    const blocks = UNICODE_BLOCKS.slice(0, 3)
    const tiles = generateTileData(blocks)
    expect(tiles.length).toBe(3)
  })

  it('should have 4 chars per tile', () => {
    const tiles = generateTileData()
    for (const tile of tiles) {
      expect(tile.chars).toHaveLength(4)
    }
  })

  it('snapshot: first 5 tiles', () => {
    const tiles = generateTileData().slice(0, 5)
    const simplified = tiles.map((t) => ({
      blockName: t.block.name,
      chars: t.chars.map((c) => ({
        codepoint: c.codepoint.toString(16).padStart(4, '0'),
        printable: c.printable,
      })),
    }))
    expect(simplified).toMatchSnapshot()
  })

  it('snapshot: tiles for specific blocks', () => {
    const blockNames = ['Basic_Latin', 'Hiragana', 'Katakana']
    const blocks = blockNames
      .map((name) => UNICODE_BLOCKS.find((b) => b.name === name)!)
      .filter(Boolean)
    const tiles = generateTileData(blocks)
    const simplified = tiles.map((t) => ({
      blockName: t.block.name,
      displayName: t.block.displayName,
      chars: t.chars.map((c) => ({
        codepoint: c.codepoint.toString(16).padStart(4, '0'),
        char: c.char,
        printable: c.printable,
      })),
    }))
    expect(simplified).toMatchSnapshot()
  })
})

describe('generateScriptTilesSvg', () => {
  it('should generate valid SVG', () => {
    const blocks = UNICODE_BLOCKS.slice(0, 4)
    const svg = generateScriptTilesSvg({ blocks })
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('</svg>')
  })

  it('should include font-face', () => {
    const blocks = UNICODE_BLOCKS.slice(0, 4)
    const svg = generateScriptTilesSvg({ blocks, fontPath: '/custom/font.otf' })
    expect(svg).toContain("font-family: 'Unifont'")
    expect(svg).toContain('/custom/font.otf')
  })

  it('should include block labels', () => {
    const blocks = UNICODE_BLOCKS.slice(0, 4)
    const svg = generateScriptTilesSvg({ blocks })
    for (const block of blocks) {
      expect(svg).toContain(block.displayName)
    }
  })

  it('snapshot: SVG for first 4 blocks', () => {
    const blocks = UNICODE_BLOCKS.slice(0, 4)
    const svg = generateScriptTilesSvg({ blocks, cols: 2, cellSize: 24 })
    expect(svg).toMatchSnapshot()
  })

  it('snapshot: SVG for Japanese blocks', () => {
    const blockNames = ['Hiragana', 'Katakana']
    const blocks = blockNames
      .map((name) => UNICODE_BLOCKS.find((b) => b.name === name)!)
      .filter(Boolean)
    const svg = generateScriptTilesSvg({ blocks, cols: 2, cellSize: 32 })
    expect(svg).toMatchSnapshot()
  })

  it('snapshot: SVG with custom options', () => {
    const blocks = UNICODE_BLOCKS.slice(0, 2)
    const svg = generateScriptTilesSvg({
      blocks,
      cols: 1,
      cellSize: 48,
      fontPath: '/fonts/custom.otf',
    })
    expect(svg).toMatchSnapshot()
  })
})
