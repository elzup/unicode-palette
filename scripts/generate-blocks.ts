import { readdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const BLOCK_DIR = 'node_modules/@unicode/unicode-16.0.0/Block'
const OUTPUT_FILE = 'src/core/blocks.generated.ts'

type BlockInfo = {
  name: string
  displayName: string
  start: number
  end: number
}

function getBlockInfo(blockName: string): BlockInfo | null {
  try {
    const codePoints: number[] = require(`@unicode/unicode-16.0.0/Block/${blockName}/code-points.js`)
    if (codePoints.length === 0) return null

    const start = Math.min(...codePoints)
    const end = Math.max(...codePoints)
    const displayName = blockName.replace(/_/g, ' ')

    return { name: blockName, displayName, start, end }
  } catch {
    return null
  }
}

function main() {
  const blockNames = readdirSync(BLOCK_DIR)
  const blocks: BlockInfo[] = []

  for (const name of blockNames) {
    const info = getBlockInfo(name)
    if (info) {
      blocks.push(info)
    }
  }

  // Sort by start codepoint
  blocks.sort((a, b) => a.start - b.start)

  const output = `// Auto-generated from @unicode/unicode-16.0.0
// Do not edit manually. Run: yarn tsx scripts/generate-blocks.ts

export type UnicodeBlock = {
  name: string
  displayName: string
  start: number
  end: number
}

export const UNICODE_BLOCKS: UnicodeBlock[] = [
${blocks
  .map(
    (b) =>
      `  { name: '${b.name}', displayName: '${
        b.displayName
      }', start: 0x${b.start
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')}, end: 0x${b.end
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')} },`
  )
  .join('\n')}
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

// Filter blocks by BMP only (U+0000 to U+FFFF)
export const BMP_BLOCKS = UNICODE_BLOCKS.filter((b) => b.start <= 0xFFFF)

// Get block by codepoint
export function getBlockByCodepoint(codepoint: number): UnicodeBlock | undefined {
  return UNICODE_BLOCKS.find((b) => codepoint >= b.start && codepoint <= b.end)
}
`

  writeFileSync(OUTPUT_FILE, output)
  console.log(`Generated: ${OUTPUT_FILE}`)
  console.log(`Total blocks: ${blocks.length}`)
  console.log(`BMP blocks: ${blocks.filter((b) => b.start <= 0xffff).length}`)
}

main()
