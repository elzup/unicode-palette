import { defineCommand } from 'citty'
import { renderSvgToFile, renderPngToFile } from '../../node-io'
import { generateChars } from '../../render'
import { UNICODE_BLOCKS } from '../../core'

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

export const printCommand = defineCommand({
  meta: {
    name: 'print',
    description: 'Print Unicode characters to console or file',
  },
  args: {
    range: {
      type: 'positional',
      description: 'Range (hex-hex, e.g., 0000-00FF) or block name',
      required: false,
    },
    output: {
      type: 'string',
      alias: 'o',
      description: 'Output file path (.svg or .png)',
    },
    cols: {
      type: 'string',
      alias: 'c',
      description: 'Number of columns',
      default: '16',
    },
    'cell-size': {
      type: 'string',
      description: 'Cell size in pixels (for image output)',
      default: '16',
    },
    'fill-unassigned': {
      type: 'boolean',
      alias: 'f',
      description: 'Fill unassigned codepoints',
      default: false,
    },
    background: {
      type: 'boolean',
      alias: 'b',
      description: 'Show category colors as background',
      default: false,
    },
    list: {
      type: 'boolean',
      alias: 'l',
      description: 'List available block names',
      default: false,
    },
  },
  run({ args }) {
    // List blocks
    if (args.list) {
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

    if (args.range) {
      const rangeResult = parseRange(args.range)
      if (rangeResult) {
        start = rangeResult.start
        end = rangeResult.end
      } else {
        const block = findBlockByName(args.range)
        if (block) {
          start = block.start
          end = block.end
        } else {
          console.error(`Invalid range or block name: ${args.range}`)
          console.error('Use --list to see available block names')
          process.exit(1)
        }
      }
    }

    const cols = parseInt(args.cols, 10)
    const cellSize = parseInt(args['cell-size'], 10)
    const total = end - start + 1
    const rows = Math.ceil(total / cols)

    const options = {
      cols,
      rows,
      cellSize,
      startCodepoint: start,
      showBackground: args.background,
      skipUnassigned: !args['fill-unassigned'],
    }

    // Output to file
    if (args.output) {
      const ext = args.output.split('.').pop()?.toLowerCase()
      if (ext === 'png') {
        renderPngToFile(args.output, options)
      } else {
        renderSvgToFile(args.output, options)
      }
      return
    }

    // Console output
    const chars = generateChars(options)
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
})
