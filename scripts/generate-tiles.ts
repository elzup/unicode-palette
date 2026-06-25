import { writeFileSync } from 'node:fs'
import playwright from 'playwright'
import { generateScriptTilesSvg } from '../src/generator/script-tiles'
import { UNICODE_BLOCKS } from '../src/core'
import { svgToPng } from './lib/svg-renderer'

async function main() {
  console.log('Generating script tiles...')
  console.log(`Total Unicode blocks: ${UNICODE_BLOCKS.length}`)

  const options = {
    cellSize: 20,
    cols: 4,
    charCount: 8,
    useWebFonts: true,
    blocks: UNICODE_BLOCKS,
  }

  // Generate SVG
  const svg = generateScriptTilesSvg(options)
  writeFileSync('./output/script-tiles.svg', svg)
  console.log('SVG saved: output/script-tiles.svg')

  // Generate PNG
  console.log('Generating PNG (loading fonts)...')
  const browser = await playwright.chromium.launch()
  await svgToPng(browser, svg, './output/script-tiles.png')
  await browser.close()
  console.log('PNG saved: output/script-tiles.png')

  console.log('Done!')
}

main().catch(console.error)
