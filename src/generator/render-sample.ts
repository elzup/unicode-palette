import { createCanvas } from 'canvas'
import * as fs from 'fs'

const CELL_SIZE = 16
const COLS = 40
const ROWS = 25
const TOTAL = COLS * ROWS // 1000

const START_CODEPOINT = 0x0000

// 非表示文字の判定
const RE_CONTROL = /\p{Cc}/u // 制御文字
const RE_SURROGATE = /\p{Cs}/u // サロゲート
const RE_UNASSIGNED = /\p{Cn}/u // 未割り当て・非文字
const RE_PRIVATE = /\p{Co}/u // 私用領域

type CharCategory = 'printable' | 'control' | 'surrogate' | 'unassigned' | 'private'

function getCategory(char: string): CharCategory {
  if (RE_CONTROL.test(char)) return 'control'
  if (RE_SURROGATE.test(char)) return 'surrogate'
  if (RE_UNASSIGNED.test(char)) return 'unassigned'
  if (RE_PRIVATE.test(char)) return 'private'
  return 'printable'
}

const CATEGORY_COLORS: Record<CharCategory, string> = {
  printable: '#ffffff', // 白
  control: '#cccccc', // グレー
  surrogate: '#ffcccc', // 薄い赤
  unassigned: '#cccccc', // グレー
  private: '#ffffcc', // 薄い黄
}

function render() {
  const width = COLS * CELL_SIZE // 640px
  const height = ROWS * CELL_SIZE // 400px

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // 背景を白に
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.font = '12px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let codepoint = START_CODEPOINT
  const stats: Record<CharCategory, number> = {
    printable: 0,
    control: 0,
    surrogate: 0,
    unassigned: 0,
    private: 0,
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // サロゲートペア範囲をスキップ
      if (codepoint >= 0xd800 && codepoint <= 0xdfff) {
        codepoint = 0xe000
      }

      const char = String.fromCodePoint(codepoint)
      const category = getCategory(char)
      stats[category]++

      const x = col * CELL_SIZE
      const y = row * CELL_SIZE

      // 背景色
      ctx.fillStyle = CATEGORY_COLORS[category]
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)

      // 文字描画（printable のみ）
      if (category === 'printable') {
        ctx.fillStyle = '#000000'
        ctx.fillText(char, x + CELL_SIZE / 2, y + CELL_SIZE / 2)
      }

      codepoint++
      if (codepoint - START_CODEPOINT >= TOTAL) break
    }
  }

  // PNG出力
  const buffer = canvas.toBuffer('image/png')
  const outPath = './output/unicode-sample-1000.png'

  fs.mkdirSync('./output', { recursive: true })
  fs.writeFileSync(outPath, new Uint8Array(buffer))

  console.log(`Generated: ${outPath}`)
  console.log(`Size: ${width} x ${height} px`)
  console.log(`Range: U+${START_CODEPOINT.toString(16).padStart(4, '0')} - U+${(codepoint - 1).toString(16).padStart(4, '0')}`)
  console.log(`Stats:`, stats)
}

render()
