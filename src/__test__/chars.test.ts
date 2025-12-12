import { describe, it, expect } from 'vitest'
import { generateChars, generateGrid, generateSvgString } from '../render/chars'

describe('generateChars', () => {
  it('should generate chars with default options', () => {
    const chars = generateChars({ cols: 4, rows: 4 })
    expect(chars).toHaveLength(16)
  })

  it('should start from specified codepoint', () => {
    const chars = generateChars({ cols: 4, rows: 1, startCodepoint: 0x0041 })
    expect(chars[0].codepoint).toBe(0x0041)
    expect(chars[0].char).toBe('A')
  })

  it('should skip surrogate range', () => {
    const chars = generateChars({ cols: 4, rows: 1, startCodepoint: 0xd7ff })
    expect(chars[0].codepoint).toBe(0xd7ff)
    expect(chars[1].codepoint).toBe(0xe000) // skipped surrogates
  })

  it('snapshot: first 16 chars from U+0000', () => {
    const chars = generateChars({ cols: 4, rows: 4, startCodepoint: 0x0000 })
    const simplified = chars.map((c) => ({
      codepoint: c.codepoint.toString(16).padStart(4, '0'),
      category: c.category,
    }))
    expect(simplified).toMatchSnapshot()
  })

  it('snapshot: chars from Basic Latin (printable range)', () => {
    const chars = generateChars({ cols: 8, rows: 2, startCodepoint: 0x0020 })
    const simplified = chars.map((c) => ({
      codepoint: c.codepoint.toString(16).padStart(4, '0'),
      char: c.char,
      category: c.category,
    }))
    expect(simplified).toMatchSnapshot()
  })

  it('snapshot: chars from Hiragana', () => {
    const chars = generateChars({ cols: 8, rows: 2, startCodepoint: 0x3040 })
    const simplified = chars.map((c) => ({
      codepoint: c.codepoint.toString(16).padStart(4, '0'),
      char: c.char,
      category: c.category,
    }))
    expect(simplified).toMatchSnapshot()
  })
})

describe('generateGrid', () => {
  it('should generate grid with correct dimensions', () => {
    const grid = generateGrid({ cols: 4, rows: 3 })
    expect(grid.chars).toHaveLength(3) // 3 rows
    expect(grid.chars[0]).toHaveLength(4) // 4 cols
  })

  it('should have correct config', () => {
    const grid = generateGrid({ cols: 8, rows: 4, cellSize: 24 })
    expect(grid.config.cols).toBe(8)
    expect(grid.config.rows).toBe(4)
    expect(grid.config.cellSize).toBe(24)
    expect(grid.config.width).toBe(192) // 8 * 24
    expect(grid.config.height).toBe(96) // 4 * 24
  })

  it('snapshot: small grid structure', () => {
    const grid = generateGrid({ cols: 4, rows: 2, startCodepoint: 0x0041 })
    const simplified = {
      config: grid.config,
      chars: grid.chars.map((row) =>
        row.map((c) => ({
          codepoint: c.codepoint.toString(16).padStart(4, '0'),
          char: c.char,
        }))
      ),
    }
    expect(simplified).toMatchSnapshot()
  })
})

describe('generateSvgString', () => {
  it('should generate valid SVG', () => {
    const svg = generateSvgString({ cols: 4, rows: 2 })
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('</svg>')
  })

  it('should include font-face', () => {
    const svg = generateSvgString({ cols: 4, rows: 2, fontPath: '/test/font.otf' })
    expect(svg).toContain("font-family: 'Unifont'")
    expect(svg).toContain('/test/font.otf')
  })

  it('should have correct dimensions', () => {
    const svg = generateSvgString({ cols: 8, rows: 4, cellSize: 16 })
    expect(svg).toContain('width="128"')
    expect(svg).toContain('height="64"')
  })

  it('snapshot: small SVG output', () => {
    const svg = generateSvgString({
      cols: 4,
      rows: 2,
      cellSize: 16,
      startCodepoint: 0x0041, // 'A'
    })
    expect(svg).toMatchSnapshot()
  })

  it('snapshot: SVG with special characters', () => {
    const svg = generateSvgString({
      cols: 4,
      rows: 1,
      cellSize: 16,
      startCodepoint: 0x003c, // '<', '=', '>', '?'
    })
    expect(svg).toMatchSnapshot()
  })

  it('snapshot: SVG from Hiragana', () => {
    const svg = generateSvgString({
      cols: 8,
      rows: 2,
      cellSize: 16,
      startCodepoint: 0x3042, // 'あ'
    })
    expect(svg).toMatchSnapshot()
  })
})
