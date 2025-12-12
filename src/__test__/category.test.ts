import { describe, it, expect } from 'vitest'
import { getCategory, escapeXml, skipSurrogate, resolveConfig, CATEGORY_COLORS } from '../core/category'

describe('getCategory', () => {
  it('should identify printable characters', () => {
    expect(getCategory('A')).toBe('printable')
    expect(getCategory('あ')).toBe('printable')
    expect(getCategory('漢')).toBe('printable')
    expect(getCategory('🎉')).toBe('printable')
  })

  it('should identify control characters', () => {
    expect(getCategory('\x00')).toBe('control')
    expect(getCategory('\x1F')).toBe('control')
    expect(getCategory('\x7F')).toBe('control')
  })

  it('should identify unassigned codepoints', () => {
    expect(getCategory('\u0378')).toBe('unassigned')
  })

  it('should identify private use characters', () => {
    expect(getCategory('\uE000')).toBe('private')
    expect(getCategory('\uF8FF')).toBe('private')
  })

  it('snapshot: category results for various characters', () => {
    const chars = ['A', 'あ', '漢', '🎉', '\x00', '\x1F', '\uE000', '\u0378', ' ', '!', '~']
    const results = chars.map((c) => ({
      char: c.codePointAt(0)!.toString(16).padStart(4, '0'),
      category: getCategory(c),
    }))
    expect(results).toMatchSnapshot()
  })
})

describe('escapeXml', () => {
  it('should escape XML special characters', () => {
    expect(escapeXml('<')).toBe('&lt;')
    expect(escapeXml('>')).toBe('&gt;')
    expect(escapeXml('&')).toBe('&amp;')
    expect(escapeXml('"')).toBe('&quot;')
    expect(escapeXml("'")).toBe('&apos;')
  })

  it('should not escape normal characters', () => {
    expect(escapeXml('A')).toBe('A')
    expect(escapeXml('あ')).toBe('あ')
  })

  it('snapshot: escape results', () => {
    const chars = ['<', '>', '&', '"', "'", 'A', 'あ', '漢', ' ']
    const results = chars.map((c) => ({ input: c, output: escapeXml(c) }))
    expect(results).toMatchSnapshot()
  })
})

describe('skipSurrogate', () => {
  it('should skip surrogate range', () => {
    expect(skipSurrogate(0xd800)).toBe(0xe000)
    expect(skipSurrogate(0xdfff)).toBe(0xe000)
    expect(skipSurrogate(0xdc00)).toBe(0xe000)
  })

  it('should not skip non-surrogate codepoints', () => {
    expect(skipSurrogate(0x0000)).toBe(0x0000)
    expect(skipSurrogate(0xd7ff)).toBe(0xd7ff)
    expect(skipSurrogate(0xe000)).toBe(0xe000)
    expect(skipSurrogate(0xffff)).toBe(0xffff)
  })

  it('snapshot: skipSurrogate results', () => {
    const codepoints = [0x0000, 0xd7ff, 0xd800, 0xdc00, 0xdfff, 0xe000, 0xffff]
    const results = codepoints.map((cp) => ({
      input: cp.toString(16).padStart(4, '0'),
      output: skipSurrogate(cp).toString(16).padStart(4, '0'),
    }))
    expect(results).toMatchSnapshot()
  })
})

describe('resolveConfig', () => {
  it('should return default config when no options provided', () => {
    const config = resolveConfig()
    expect(config).toMatchSnapshot()
  })

  it('should merge options with defaults', () => {
    const config = resolveConfig({ cols: 32, rows: 16 })
    expect(config).toMatchSnapshot()
  })

  it('should override all options', () => {
    const config = resolveConfig({
      cols: 16,
      rows: 8,
      cellSize: 32,
      startCodepoint: 0x3000,
      fontPath: '/custom/font.otf',
      showBackground: true,
    })
    expect(config).toMatchSnapshot()
  })
})

describe('CATEGORY_COLORS', () => {
  it('snapshot: all category colors', () => {
    expect(CATEGORY_COLORS).toMatchSnapshot()
  })
})
