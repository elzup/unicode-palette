import { parseArgs } from 'node:util'
import { generateChars } from '../../render'
import { UNICODE_BLOCKS } from '../../core'
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

const help = `unicode-palette print - Print Unicode characters to console

Usage: unicode-palette print [range] [options]

Arguments:
  range            Range (hex-hex, e.g., 0000-00FF) or block name

Options:
  -c, --cols <n>   Number of columns (default: all in one line)
  -l, --list       List available block names
  -h, --help       Show this help`

export const printCommand: Command = {
  name: 'print',
  description: 'Print Unicode characters to console',
  help,
  run(argv) {
    const { values, positionals } = parseArgs({
      args: argv,
      options: {
        cols: { type: 'string', short: 'c' },
        list: { type: 'boolean', short: 'l', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
      allowPositionals: true,
    })

    if (values.help) {
      console.log(help)
      return
    }

    // List blocks
    if (values.list) {
      console.log('Available blocks:')
      for (const block of UNICODE_BLOCKS) {
        const startHex = block.start.toString(16).toUpperCase().padStart(4, '0')
        const endHex = block.end.toString(16).toUpperCase().padStart(4, '0')
        console.log(`  ${block.name} (U+${startHex}-U+${endHex})`)
      }
      return
    }

    // Parse range
    let start = 0x0000
    let end = 0x00ff

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
          console.error('Use --list to see available block names')
          process.exit(1)
        }
      }
    }

    const total = end - start + 1
    const cols = values.cols ? parseInt(values.cols, 10) : total
    const rows = Math.ceil(total / cols)

    const chars = generateChars({
      cols,
      rows,
      startCodepoint: start,
    })

    let line = ''
    let count = 0
    for (const char of chars) {
      if (char.codepoint > end) break
      if (char.category === 'printable') {
        line += char.char
      } else {
        line += ' '
      }
      count++
      if (count % cols === 0) {
        console.log(line)
        line = ''
      }
    }
    if (line) {
      console.log(line)
    }
  },
}
