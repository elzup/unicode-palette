import { parseArgs } from 'node:util'
import { UNICODE_BLOCKS, getBlockDataByName } from '../../core'
import type { Command } from '../types'

function parseRange(range: string): { start: number; end: number } | null {
  const match = range.match(/^([0-9a-fA-F]+)-([0-9a-fA-F]+)$/)
  if (match) {
    return {
      start: parseInt(match[1], 16),
      end: parseInt(match[2], 16),
    }
  }
  return null
}

function findBlockByName(name: string) {
  const lower = name.toLowerCase()
  return UNICODE_BLOCKS.find(
    (b) =>
      b.name.toLowerCase() === lower || b.displayName.toLowerCase() === lower
  )
}

function parseSize(size: string): { cols: number; rows: number } | null {
  const match = size.match(/^(\d+)x(\d+)$/)
  if (match) {
    return {
      cols: parseInt(match[1], 10),
      rows: parseInt(match[2], 10),
    }
  }
  return null
}

function getDefinedCodepoints(start: number, end: number): number[] {
  const codepoints: number[] = []

  for (const block of UNICODE_BLOCKS) {
    if (block.end < start || block.start > end) continue

    const blockData = getBlockDataByName(block.name)
    if (!blockData) continue

    for (const range of blockData.ranges) {
      for (let cp = range.start; cp <= range.end; cp++) {
        if (cp >= start && cp <= end) {
          codepoints.push(cp)
        }
      }
    }
  }

  return codepoints
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const help = `unicode-palette random - Print random Unicode characters

Usage: unicode-palette random [range] [options]

Arguments:
  range              Range (hex-hex) or block name (default: BMP)

Options:
  -s, --size <WxH>   Grid size (COLSxROWS, e.g., 16x10) (default: 16x10)
  -h, --help         Show this help`

export const randomCommand: Command = {
  name: 'random',
  description: 'Print random Unicode characters',
  help,
  run(argv) {
    const { values, positionals } = parseArgs({
      args: argv,
      options: {
        size: { type: 'string', short: 's', default: '16x10' },
        help: { type: 'boolean', short: 'h', default: false },
      },
      allowPositionals: true,
    })

    if (values.help) {
      console.log(help)
      return
    }

    // Parse size
    const sizeResult = parseSize(values.size)
    if (!sizeResult) {
      console.error(`Invalid size format: ${values.size}`)
      console.error('Use format: COLSxROWS (e.g., 16x10)')
      process.exit(1)
    }
    const { cols, rows } = sizeResult
    const total = cols * rows

    // Parse range
    let start = 0x0000
    let end = 0xffff // BMP default

    const range = positionals[0]
    if (range) {
      const rangeResult = parseRange(range)
      if (rangeResult) {
        start = rangeResult.start
        end = rangeResult.end
      } else {
        const block = findBlockByName(range)
        if (block) {
          start = block.start
          end = block.end
        } else {
          console.error(`Invalid range or block name: ${range}`)
          process.exit(1)
        }
      }
    }

    // Get defined codepoints and shuffle
    const defined = getDefinedCodepoints(start, end)
    const shuffled = shuffle(defined)
    const selected = shuffled.slice(0, total)

    // Pad if not enough
    while (selected.length < total) {
      selected.push(0x20) // space
    }

    // Output
    for (let row = 0; row < rows; row++) {
      let line = ''
      for (let col = 0; col < cols; col++) {
        const cp = selected[row * cols + col]
        line += String.fromCodePoint(cp)
      }
      console.log(line)
    }
  },
}
