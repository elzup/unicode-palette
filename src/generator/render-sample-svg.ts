import * as fs from 'fs'

const CELL_SIZE = 16
const COLS = 64
const ROWS = 104
const TOTAL = COLS * ROWS // 6656 (約10% of BMP, 黄金比 1:1.625)

const START_CODEPOINT = 0x0000

// 非表示文字の判定
const RE_CONTROL = /\p{Cc}/u // 制御文字
const RE_SURROGATE = /\p{Cs}/u // サロゲート
const RE_UNASSIGNED = /\p{Cn}/u // 未割り当て・非文字
const RE_PRIVATE = /\p{Co}/u // 私用領域

type CharCategory =
  | 'printable'
  | 'control'
  | 'surrogate'
  | 'unassigned'
  | 'private'

function getCategory(char: string): CharCategory {
  if (RE_CONTROL.test(char)) return 'control'
  if (RE_SURROGATE.test(char)) return 'surrogate'
  if (RE_UNASSIGNED.test(char)) return 'unassigned'
  if (RE_PRIVATE.test(char)) return 'private'
  return 'printable'
}

// 実験用に一時的にコメントアウト
// const CATEGORY_COLORS: Record<CharCategory, string> = {
//   printable: '#ffffff',
//   control: '#cccccc',
//   surrogate: '#ffcccc',
//   unassigned: '#cccccc',
//   private: '#ffffcc',
// }

// XML特殊文字のエスケープ
function escapeXml(char: string): string {
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

function render() {
  const width = COLS * CELL_SIZE
  const height = ROWS * CELL_SIZE

  const textLines: string[] = []

  let codepoint = START_CODEPOINT

  for (let row = 0; row < ROWS; row++) {
    const xPositions: number[] = []
    let lineChars = ''

    for (let col = 0; col < COLS; col++) {
      // サロゲートペア範囲をスキップ
      if (codepoint >= 0xd800 && codepoint <= 0xdfff) {
        codepoint = 0xe000
      }

      const char = String.fromCodePoint(codepoint)
      const category = getCategory(char)

      // 各文字の中央位置を記録
      xPositions.push(col * CELL_SIZE + CELL_SIZE / 2)

      if (category === 'printable') {
        lineChars += escapeXml(char)
      } else {
        lineChars += ' '
      }

      codepoint++
      if (codepoint - START_CODEPOINT >= TOTAL) break
    }

    // 1行分のテキストを出力
    if (lineChars.length > 0) {
      const y = row * CELL_SIZE + CELL_SIZE * 0.8
      textLines.push(
        `<text x="${xPositions.join(' ')}" y="${y}">${lineChars}</text>`
      )
    }

    if (codepoint - START_CODEPOINT >= TOTAL) break
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    @font-face {
      font-family: 'Unifont';
      src: url('../fonts/unifont.otf') format('opentype');
    }
    text {
      font-family: 'Unifont', monospace;
      font-size: 12px;
      text-anchor: middle;
    }
  </style>
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${textLines.join('\n  ')}
</svg>`

  fs.mkdirSync('./output', { recursive: true })
  const outPath = './output/unicode-sample-10pct.svg'

  fs.writeFileSync(outPath, svg)

  console.log(`Generated: ${outPath}`)
  console.log(`Size: ${width} x ${height} px`)
  console.log(`Lines: ${textLines.length}`)
}

render()
