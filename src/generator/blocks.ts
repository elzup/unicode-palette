export type UnicodeBlock = {
  name: string
  start: number
  end: number
}

// Major Unicode blocks (BMP)
export const UNICODE_BLOCKS: UnicodeBlock[] = [
  { name: 'Basic Latin', start: 0x0000, end: 0x007f },
  { name: 'Latin-1 Supplement', start: 0x0080, end: 0x00ff },
  { name: 'Latin Extended-A', start: 0x0100, end: 0x017f },
  { name: 'Latin Extended-B', start: 0x0180, end: 0x024f },
  { name: 'IPA Extensions', start: 0x0250, end: 0x02af },
  { name: 'Greek and Coptic', start: 0x0370, end: 0x03ff },
  { name: 'Cyrillic', start: 0x0400, end: 0x04ff },
  { name: 'Armenian', start: 0x0530, end: 0x058f },
  { name: 'Hebrew', start: 0x0590, end: 0x05ff },
  { name: 'Arabic', start: 0x0600, end: 0x06ff },
  { name: 'Devanagari', start: 0x0900, end: 0x097f },
  { name: 'Bengali', start: 0x0980, end: 0x09ff },
  { name: 'Tamil', start: 0x0b80, end: 0x0bff },
  { name: 'Thai', start: 0x0e00, end: 0x0e7f },
  { name: 'Georgian', start: 0x10a0, end: 0x10ff },
  { name: 'Hangul Jamo', start: 0x1100, end: 0x11ff },
  { name: 'Hiragana', start: 0x3040, end: 0x309f },
  { name: 'Katakana', start: 0x30a0, end: 0x30ff },
  { name: 'Bopomofo', start: 0x3100, end: 0x312f },
  { name: 'CJK Unified Ideographs', start: 0x4e00, end: 0x9fff },
  { name: 'Hangul Syllables', start: 0xac00, end: 0xd7af },
  { name: 'Box Drawing', start: 0x2500, end: 0x257f },
  { name: 'Block Elements', start: 0x2580, end: 0x259f },
  { name: 'Geometric Shapes', start: 0x25a0, end: 0x25ff },
  { name: 'Miscellaneous Symbols', start: 0x2600, end: 0x26ff },
  { name: 'Dingbats', start: 0x2700, end: 0x27bf },
  { name: 'Arrows', start: 0x2190, end: 0x21ff },
  { name: 'Mathematical Operators', start: 0x2200, end: 0x22ff },
  { name: 'Currency Symbols', start: 0x20a0, end: 0x20cf },
  { name: 'Number Forms', start: 0x2150, end: 0x218f },
  { name: 'Braille Patterns', start: 0x2800, end: 0x28ff },
  { name: 'CJK Symbols and Punctuation', start: 0x3000, end: 0x303f },
  { name: 'Enclosed CJK Letters', start: 0x3200, end: 0x32ff },
  { name: 'CJK Compatibility', start: 0x3300, end: 0x33ff },
  { name: 'Halfwidth and Fullwidth Forms', start: 0xff00, end: 0xffef },
]

export function getBlockSize(block: UnicodeBlock): number {
  return block.end - block.start + 1
}

// Get 4 representative characters from a block (quartile first chars)
export function getQuartileChars(block: UnicodeBlock): number[] {
  const size = getBlockSize(block)
  const quartileSize = Math.floor(size / 4)

  return [
    block.start, // Q1
    block.start + quartileSize, // Q2
    block.start + quartileSize * 2, // Q3
    block.start + quartileSize * 3, // Q4
  ]
}
