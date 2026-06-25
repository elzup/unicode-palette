import { writeFileSync } from 'node:fs'
import playwright from 'playwright'
import { generateScriptTilesSvg } from '../src/generator/script-tiles'
import { UNICODE_BLOCKS } from '../src/core'
import { svgToPng, loadLocalFonts } from './lib/svg-renderer'

async function main() {
  // 非BMPブロックのみ（U+10000以降）
  const nonBmpBlocks = UNICODE_BLOCKS.filter((b) => b.start >= 0x10000)

  console.log('=== 非BMP専用タイル生成 ===')
  console.log(`非BMPブロック数: ${nonBmpBlocks.length}`)

  // フォント確認
  const fonts = loadLocalFonts()
  console.log('\n使用フォント:')
  fonts.forEach((f) => console.log(`  - ${f.name}: ${f.path}`))

  const options = {
    cellSize: 20,
    cols: 4,
    charCount: 8,
    useWebFonts: true,
    blocks: nonBmpBlocks,
  }

  // Generate SVG
  const svg = generateScriptTilesSvg(options)
  writeFileSync('./output/script-tiles-non-bmp.svg', svg)
  console.log('\nSVG saved: output/script-tiles-non-bmp.svg')

  // Generate PNG
  console.log('Generating PNG (loading fonts)...')
  const browser = await playwright.chromium.launch()
  await svgToPng(browser, svg, './output/script-tiles-non-bmp.png', {
    timeout: 10000,
  })
  await browser.close()
  console.log('PNG saved: output/script-tiles-non-bmp.png')

  console.log('\nDone!')
}

main().catch(console.error)
