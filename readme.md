# unicode-palette

Unicode character visualization tool - Generate grid-based character maps as SVG/PNG.

## Features

### Implemented

- [x] SVG generation with Unicode characters in grid layout
- [x] Character category detection (printable, control, surrogate, unassigned, private)
- [x] XML escape handling
- [x] GNU Unifont support for consistent character width
- [x] Console output mode (dump-scripts)

### WIP / Planned

- [ ] **Browser support** - Run in browser environment
- [ ] **Dynamic configuration**
  - [ ] Column count (characters per row)
  - [ ] Cell size (pixels per character)
  - [ ] Output format (SVG / PNG)
- [ ] **Random sampling mode** - Select random characters (excluding undefined), e.g., 30x20 grid
- [ ] **CLI mode** - Output to console with formatting
- [ ] **Script tile mode** - For each Unicode script/block, select 4 representative characters (first char from each quartile) and arrange in 2x2 tiles
- [ ] **Function abstraction** - Export reusable functions with configurable options
- [ ] **PNG export** - Convert SVG to PNG (coordinates should be shared)

## Install

```bash
npm install unicode-palette
```

## Usage

### Generate SVG sample

```bash
npx ts-node src/generator/render-sample-svg.ts
```

Output: `output/unicode-sample-10pct.svg`

### Dump to console

```bash
npx ts-node src/generator/dump-scripts.ts
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
  index.ts          # Entry point (WIP)
  unit.ts           # Utility functions
  generator/
    render-sample-svg.ts  # SVG generation
    dump-scripts.ts       # Console output
    util.ts               # Range utilities
  types/
    CodePoint.ts    # Type definitions
```

## API (Planned)

```typescript
import { renderGrid, GridOptions } from 'unicode-palette'

const options: GridOptions = {
  cols: 64,           // Characters per row
  cellSize: 16,       // Pixel size per character
  format: 'svg',      // 'svg' | 'png'
  startCodepoint: 0,
  endCodepoint: 0xffff,
  filter: 'printable' // 'all' | 'printable' | 'random'
}

// Generate SVG string
const svg = renderGrid(options)

// Random sample
const randomSvg = renderGrid({
  ...options,
  cols: 30,
  rows: 20,
  filter: 'random'
})

// Script tiles (2x2 per script)
const tiles = renderScriptTiles({
  cellSize: 32,
  scripts: ['Latin', 'Hiragana', 'Katakana', 'CJK']
})
```

## References

- [GNU Unifont](https://unifoundry.com/unifont/)
- [ISO 15924 (Scripts)](https://unicode.org/iso15924/)
- [Unicode Character Database](https://www.unicode.org/ucd/)

## License

MIT © [anozon](https://anozon.me)
