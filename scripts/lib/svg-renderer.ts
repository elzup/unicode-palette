import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Browser, Page } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export interface FontConfig {
  name: string
  path: string
  format: string
}

// Load fonts from the fonts directory
export function loadLocalFonts(): FontConfig[] {
  const fontsDir = resolve(__dirname, '../../fonts')
  return [
    {
      name: 'Noto Sans Local',
      path: resolve(fontsDir, 'NotoSans-Regular.ttf'),
      format: 'truetype',
    },
    {
      name: 'Unifont',
      path: resolve(fontsDir, 'unifont.otf'),
      format: 'opentype',
    },
    {
      name: 'Unifont Upper',
      path: resolve(fontsDir, 'unifont_upper.otf'),
      format: 'opentype',
    },
    {
      name: 'BabelStone Han',
      path: resolve(fontsDir, 'BabelStoneHan.ttf'),
      format: 'truetype',
    },
    {
      name: 'Noto Sans Phaistos',
      path: resolve(fontsDir, 'NotoSansPhaistos-Regular.ttf'),
      format: 'truetype',
    },
    {
      name: 'Noto Sans Vithkuqi',
      path: resolve(fontsDir, 'NotoSansVithkuqi-Regular.ttf'),
      format: 'truetype',
    },
    {
      name: 'Noto Sans Todhri',
      path: resolve(fontsDir, 'NotoSansTodhri-Regular.ttf'),
      format: 'truetype',
    },
  ]
}

// Generate CSS for local fonts
export function generateFontFaceCSS(fonts: FontConfig[]): string {
  return fonts
    .map((font) => {
      const base64 = readFileSync(font.path).toString('base64')
      return `
    @font-face {
      font-family: '${font.name}';
      src: url('data:font/${font.format === 'opentype' ? 'otf' : font.format};base64,${base64}') format('${font.format}');
      font-display: block;
    }`
    })
    .join('\n')
}

// Render SVG to PNG using Playwright
export async function svgToPng(
  browser: Browser,
  svgContent: string,
  outputPath: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = 8000 } = options
  const page = await browser.newPage()

  const fonts = loadLocalFonts()
  const fontFaceCSS = generateFontFaceCSS(fonts)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${fontFaceCSS}
    body { margin: 0; padding: 0; }
    svg { display: block; }
  </style>
</head>
<body>
${svgContent}
</body>
</html>`

  await page.setContent(html)
  await page.waitForFunction(() => document.fonts.ready)
  await page.waitForTimeout(timeout)

  const svgElement = await page.$('svg')
  if (!svgElement) {
    throw new Error('SVG element not found')
  }

  await svgElement.screenshot({ path: outputPath, type: 'png' })
  await page.close()
}

// Check which fonts are actually loaded in the page
export async function checkLoadedFonts(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const fonts: string[] = []
    document.fonts.forEach((font) => {
      if (font.status === 'loaded') {
        fonts.push(`${font.family} (${font.status})`)
      }
    })
    return fonts
  })
}
