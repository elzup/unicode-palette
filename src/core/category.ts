import type { CharCategory, GridOptions, GridConfig } from '../types'
import { DEFAULT_CONFIG } from '../types'

const RE_CONTROL = /\p{Cc}/u
const RE_SURROGATE = /\p{Cs}/u
const RE_UNASSIGNED = /\p{Cn}/u
const RE_PRIVATE = /\p{Co}/u

export function getCategory(char: string): CharCategory {
  if (RE_CONTROL.test(char)) return 'control'
  if (RE_SURROGATE.test(char)) return 'surrogate'
  if (RE_UNASSIGNED.test(char)) return 'unassigned'
  if (RE_PRIVATE.test(char)) return 'private'
  return 'printable'
}

export function escapeXml(char: string): string {
  switch (char) {
    case '<':
      return '&lt;'
    case '>':
      return '&gt;'
    case '&':
      return '&amp;'
    case '"':
      return '&quot;'
    case "'":
      return '&apos;'
    default:
      return char
  }
}

export const CATEGORY_COLORS: Record<CharCategory, string> = {
  printable: '#ffffff',
  control: '#cccccc',
  surrogate: '#ffcccc',
  unassigned: '#cccccc',
  private: '#ffffcc',
  noGlyph: '#ffccff',
}

export function resolveConfig(options: GridOptions = {}): GridConfig {
  return { ...DEFAULT_CONFIG, ...options }
}

export function skipSurrogate(codepoint: number): number {
  if (codepoint >= 0xd800 && codepoint <= 0xdfff) {
    return 0xe000
  }
  return codepoint
}
