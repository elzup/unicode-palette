import { createCanvas, registerFont } from 'canvas'
import * as fs from 'fs'

// GNU Unifont を登録（BMP全体をカバー）
const UNIFONT_PATH = './fonts/unifont.otf'
if (fs.existsSync(UNIFONT_PATH)) {
  registerFont(UNIFONT_PATH, { family: 'Unifont' })
  console.log(`Font loaded: ${UNIFONT_PATH}`)
} else {
  console.warn('Warning: Unifont not found at', UNIFONT_PATH)
}

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
  | 'noGlyph' // フォントにグリフがない

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
  noGlyph: '#ffccff', // 薄い紫（フォント未対応）
}

function render() {
  const width = COLS * CELL_SIZE // 640px
  const height = ROWS * CELL_SIZE // 400px

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // 背景を白に
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.font = '12px Unifont'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let codepoint = START_CODEPOINT
  const stats: Record<CharCategory, number> = {
    printable: 0,
    control: 0,
    surrogate: 0,
    unassigned: 0,
    private: 0,
    noGlyph: 0,
  }

  // 豆腐（.notdef）検出用: 未定義文字の幅を基準にする
  const notdefWidth = ctx.measureText('\uFFFF').width

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

      // 文字描画（printable のみ、豆腐チェック付き）
      if (category === 'printable') {
        const charWidth = ctx.measureText(char).width
        if (Math.abs(charWidth - notdefWidth) < 0.1) {
          // 豆腐（グリフなし）
          stats.printable--
          stats.noGlyph++
          ctx.fillStyle = CATEGORY_COLORS.noGlyph
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
        } else {
          ctx.fillStyle = '#000000'
          ctx.fillText(char, x + CELL_SIZE / 2, y + CELL_SIZE / 2)
        }
      }

      codepoint++
      if (codepoint - START_CODEPOINT >= TOTAL) break
    }
  }

  // PNG出力
  const buffer = canvas.toBuffer('image/png')
  const outPath = './output/unicode-sample-10pct.png'

  fs.mkdirSync('./output', { recursive: true })
  fs.writeFileSync(outPath, new Uint8Array(buffer))

  console.log(`Generated: ${outPath}`)
  console.log(`Size: ${width} x ${height} px`)
  console.log(`Range: U+${START_CODEPOINT.toString(16).padStart(4, '0')} - U+${(codepoint - 1).toString(16).padStart(4, '0')}`)
  console.log(`Stats:`, stats)
}

render()
