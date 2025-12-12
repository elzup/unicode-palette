import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import prettier from 'prettier'
import {
  UnicodeBlocksDataSchema,
  type UnicodeBlockData,
  type UnicodeBlocksData,
  type CodepointRange,
} from '../src/core/schema'

const require = createRequire(import.meta.url)

const BLOCK_DIR = 'node_modules/@unicode/unicode-17.0.0/Block'
const OUTPUT_DIR = 'data'
const OUTPUT_JSON = `${OUTPUT_DIR}/unicode-blocks.json`
const OUTPUT_JSON_MIN = `${OUTPUT_DIR}/unicode-blocks.min.json`
const OUTPUT_CSV = `${OUTPUT_DIR}/unicode-blocks.csv`

// Get all unassigned codepoints
function getUnassignedSet(): Set<number> {
  const unassigned: number[] = require('@unicode/unicode-17.0.0/General_Category/Unassigned/code-points.js')
  return new Set(unassigned)
}

// Convert sorted codepoints to consecutive ranges
function toRanges(codepoints: number[]): CodepointRange[] {
  if (codepoints.length === 0) return []

  const sorted = [...codepoints].sort((a, b) => a - b)
  const ranges: CodepointRange[] = []

  let start = sorted[0]
  let end = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      ranges.push({ start, end })
      start = sorted[i]
      end = sorted[i]
    }
  }
  ranges.push({ start, end })

  return ranges
}

function getBlockData(
  blockName: string,
  unassignedSet: Set<number>
): UnicodeBlockData | null {
  try {
    const allCodepoints: number[] = require(`@unicode/unicode-17.0.0/Block/${blockName}/code-points.js`)
    if (allCodepoints.length === 0) return null

    const blockStart = Math.min(...allCodepoints)
    const blockEnd = Math.max(...allCodepoints)

    // Filter out unassigned codepoints
    const definedCodepoints = allCodepoints.filter(
      (cp) => !unassignedSet.has(cp)
    )
    const unassignedCount = allCodepoints.length - definedCodepoints.length

    const ranges = toRanges(definedCodepoints)
    const displayName = blockName.replace(/_/g, ' ')

    return {
      name: blockName,
      displayName,
      blockStart,
      blockEnd,
      definedCount: definedCodepoints.length,
      unassignedCount,
      ranges,
    }
  } catch {
    return null
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const unassignedSet = getUnassignedSet()
  console.log(`Loaded ${unassignedSet.size} unassigned codepoints`)

  const blockNames = readdirSync(BLOCK_DIR)
  const blocks: UnicodeBlockData[] = []

  for (const name of blockNames) {
    const data = getBlockData(name, unassignedSet)
    if (data) {
      blocks.push(data)
    }
  }

  // Sort by block start
  blocks.sort((a, b) => a.blockStart - b.blockStart)

  const bmpBlocks = blocks.filter((b) => b.blockStart <= 0xffff)

  const output: UnicodeBlocksData = {
    version: '17.0.0',
    generatedAt: new Date().toISOString(),
    totalBlocks: blocks.length,
    bmpBlocks: bmpBlocks.length,
    blocks,
  }

  // Validate with zod
  const validated = UnicodeBlocksDataSchema.parse(output)

  // Write JSON (prettified with prettier)
  const jsonStr = JSON.stringify(validated)
  const prettified = await prettier.format(jsonStr, { parser: 'json' })
  writeFileSync(OUTPUT_JSON, prettified)
  console.log(`Generated: ${OUTPUT_JSON}`)

  // Write minified JSON
  writeFileSync(OUTPUT_JSON_MIN, JSON.stringify(validated))
  console.log(`Generated: ${OUTPUT_JSON_MIN}`)

  // Write CSV
  const csvHeader =
    'name,displayName,blockStart,blockEnd,definedCount,unassignedCount,ranges'
  const csvRows = blocks.map((b) => {
    const rangesStr = b.ranges.map((r) => `${r.start}-${r.end}`).join(',')
    // Quote fields that contain commas
    const quotedRanges = rangesStr.includes(',') ? `"${rangesStr}"` : rangesStr
    return `${b.name},${b.displayName},${b.blockStart},${b.blockEnd},${b.definedCount},${b.unassignedCount},${quotedRanges}`
  })
  const csv = [csvHeader, ...csvRows].join('\n')
  writeFileSync(OUTPUT_CSV, csv)
  console.log(`Generated: ${OUTPUT_CSV}`)

  // Stats
  console.log(`\nStats:`)
  console.log(`  Total blocks: ${blocks.length}`)
  console.log(`  BMP blocks: ${bmpBlocks.length}`)

  const totalDefined = blocks.reduce((sum, b) => sum + b.definedCount, 0)
  const totalUnassigned = blocks.reduce((sum, b) => sum + b.unassignedCount, 0)
  console.log(`  Total defined: ${totalDefined}`)
  console.log(`  Total unassigned: ${totalUnassigned}`)

  // Show blocks with most unassigned
  const blocksWithGaps = blocks
    .filter((b) => b.unassignedCount > 0)
    .sort((a, b) => b.unassignedCount - a.unassignedCount)
    .slice(0, 5)

  console.log(`\nTop 5 blocks with unassigned:`)
  for (const b of blocksWithGaps) {
    const pct = (
      (b.unassignedCount / (b.blockEnd - b.blockStart + 1)) *
      100
    ).toFixed(1)
    console.log(`  ${b.displayName}: ${b.unassignedCount} (${pct}%)`)
  }
}

main()
