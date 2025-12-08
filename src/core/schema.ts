import { z } from 'zod'

// Range of consecutive defined codepoints
export const CodepointRangeSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
})

export type CodepointRange = z.infer<typeof CodepointRangeSchema>

// Unicode block with defined ranges (excluding unassigned)
export const UnicodeBlockDataSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  blockStart: z.number().int().min(0),
  blockEnd: z.number().int().min(0),
  definedCount: z.number().int().min(0),
  unassignedCount: z.number().int().min(0),
  ranges: z.array(CodepointRangeSchema),
})

export type UnicodeBlockData = z.infer<typeof UnicodeBlockDataSchema>

// Full data file schema
export const UnicodeBlocksDataSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  totalBlocks: z.number().int(),
  bmpBlocks: z.number().int(),
  blocks: z.array(UnicodeBlockDataSchema),
})

export type UnicodeBlocksData = z.infer<typeof UnicodeBlocksDataSchema>

// Validation helper
export function parseUnicodeBlocksData(data: unknown): UnicodeBlocksData {
  return UnicodeBlocksDataSchema.parse(data)
}

export function safeParseUnicodeBlocksData(data: unknown) {
  return UnicodeBlocksDataSchema.safeParse(data)
}
