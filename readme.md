# unicode-palette

Unicode character visualization tool - Generate grid-based character maps as SVG/PNG.

## Unicode Block Data

This repository includes pre-generated Unicode block data (Unicode 16.0.0, 338 blocks) that can be used directly:

| File                                                               | Description                              |
| ------------------------------------------------------------------ | ---------------------------------------- |
| [data/unicode-blocks.json](data/unicode-blocks.json)               | Full block data with ranges              |
| [data/unicode-blocks.csv](data/unicode-blocks.csv)                 | Tabular format for spreadsheets/analysis |
| [data/unicode-blocks.schema.json](data/unicode-blocks.schema.json) | JSON Schema for validation               |

Each block includes: name, display name, code point range, defined/unassigned counts, and character ranges.



```rb
require 'json'
block = JSON.parse(File.read('data/unicode-blocks.json'))['blocks'].find{|b| b['name']=='Bopomofo'}\
puts (0...20).map{|i| (block['blockStart']+i).chr('UTF-8')}.join
㄀㄁㄂㄃㄄ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓ #  Note:  ㄀~㄄ are unassigned
puts block['ranges'].flat_map{|r| (r['start']..r['end']).to_a}.first(20).pack('U*')
ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘ # filter out unassigned
```

```sh
$ jq -r '.blocks[] | select(.name=="Tifinagh") | [range(.blockStart; .blockStart+20)] | implode' unicode-blocks.json
ⴰⴱⴲⴳⴴⴵⴶⴷⴸⴹⴺⴻⴼⴽⴾⴿⵀⵁⵂⵃ

jq -r '.blocks[] | select(.name=="Superscripts_And_Subscripts") | [.ranges[] | range(.start; .end+1)] | .[:20] | implode' data/unicode-blocks.json
⁰ⁱ⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ₀₁₂₃₄₅
```


```js
const data = require('./data/unicode-blocks.json')
const block = data.blocks.find(b => b.name === 'Greek_And_Coptic')
const toChar = cp => String.fromCodePoint(cp)
const range = (n) => [...Array(n).keys()]

// Simple: from blockStart (may include unassigned holes)
range(20).map(i => toChar(block.blockStart + i)).join('')
// ͰͱͲͳʹ͵Ͷͷ͸͹ͺͻͼͽ;Ϳ΀΁΂΃

// Using ranges: only defined characters (no holes)
block.ranges.flatMap(r => range(r.end - r.start + 1)).slice(0, 20)
  .map(i => toChar(r.start + i)).join('')
// ͰͱͲͳʹ͵Ͷͷͺͻͼͽ;Ϳ΄΅Ά·ΈΉ
```

## Features

### Implemented

- [x] SVG generation with Unicode characters in grid layout
- [x] Character category detection (printable, control, surrogate, unassigned, private)
- [x] XML escape handling
- [x] GNU Unifont support for consistent character width
- [x] Console output mode (dump-scripts)
- [x] **Script tile mode** - For each Unicode block, select 4 representative characters (first char from each quartile) and arrange in 2x2 tiles
- [x] **Full Unicode block data** - 338 blocks from `@unicode/unicode-16.0.0`
- [x] **Function abstraction** - Export reusable functions with configurable options
- [x] **PNG export** - Convert SVG to PNG using canvas

### WIP / Planned

- [ ] **Browser support** - Run in browser environment
- [ ] **Random sampling mode** - Select random characters (excluding undefined), e.g., 30x20 grid
- [ ] **CLI mode** - Output to console with formatting

## Install

```bash
yarn add unicode-palette
```

## Usage

### Generate SVG sample

```bash
yarn tsx src/generator/render-sample-svg.ts
```

Output: `output/unicode-sample-10pct.svg`

### Generate Script Tiles

```bash
yarn tsx src/generator/render-script-tiles.ts
```

Output: `output/script-tiles.svg`

### Dump to console

```bash
yarn tsx src/generator/dump-scripts.ts
```

## Configuration (Current Defaults)

| Parameter | Value | Description                    |
| --------- | ----- | ------------------------------ |
| CELL_SIZE | 16    | Pixel size per character       |
| COLS      | 64    | Characters per row             |
| ROWS      | 104   | Number of rows                 |
| TOTAL     | 6656  | Total characters (~10% of BMP) |

## Font Setup

GNU Unifont is required for consistent character display.

```bash
bash scripts/setup-font.sh
```

Or install to system:

```bash
cp fonts/unifont.otf ~/Library/Fonts/  # macOS
```

## Architecture

```
src/
  index.ts              # Main exports (browser compatible)
  node.ts               # Node.js exports (file I/O + canvas)
  unit.ts               # Utility functions
  types/
    index.ts            # Type definitions
  core/
    blocks.generated.ts # Unicode block definitions (338 blocks)
    category.ts         # Character category detection
    index.ts            # Core exports
  render/
    chars.ts            # Character grid generation
    script-tiles.ts     # Script tile generation
    index.ts            # Render exports
  node-io/
    file.ts             # SVG file output
    png.ts              # PNG generation (canvas)
    index.ts            # Node I/O exports
  generator/            # Legacy scripts (to be migrated)
scripts/
  generate-blocks.ts    # Generate blocks.generated.ts from @unicode/unicode-16.0.0
```

## API

```typescript
import {
  generateSvgString,
  generateScriptTilesSvg,
  UNICODE_BLOCKS,
  BMP_BLOCKS,
  type GridOptions,
} from 'unicode-palette'

// Generate SVG string
const svg = generateSvgString({
  cols: 64,
  rows: 104,
  cellSize: 16,
})

// Script tiles (2x2 per block)
const tiles = generateScriptTilesSvg({
  cellSize: 32,
  cols: 8,
  bmpOnly: true, // Use BMP_BLOCKS (164 blocks)
})

// Access Unicode blocks
console.log(UNICODE_BLOCKS.length) // 338
console.log(BMP_BLOCKS.length) // 164
```

### Node.js (File I/O)

```typescript
import {
  renderSvgToFile,
  renderScriptTilesToFile,
  renderPngToFile,
} from 'unicode-palette/node'

renderSvgToFile('./output/unicode.svg')
renderScriptTilesToFile('./output/tiles.svg')
renderPngToFile('./output/unicode.png')
```

## Regenerate Block Data

Block data is generated from `@unicode/unicode-16.0.0`:

```bash
yarn tsx scripts/generate-blocks.ts
```

## References

- [GNU Unifont](https://unifoundry.com/unifont/)
- [@unicode/unicode-16.0.0](https://www.npmjs.com/package/@unicode/unicode-16.0.0)
- [ISO 15924 (Scripts)](https://unicode.org/iso15924/)
- [Unicode Character Database](https://www.unicode.org/ucd/)

## License

MIT © [anozon](https://anozon.me)
