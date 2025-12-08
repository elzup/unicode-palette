# unicode-palette

Unicode character visualization tool - Generate grid-based character maps as SVG/PNG.

## Features

### Implemented

- [x] SVG generation with Unicode characters in grid layout
- [x] Character category detection (printable, control, surrogate, unassigned, private)
- [x] XML escape handling
- [x] GNU Unifont support for consistent character width
- [x] Console output mode (dump-scripts)
- [x] **Script tile mode** - For each Unicode block, select 4 representative characters (first char from each quartile) and arrange in 2x2 tiles
- [x] **Full Unicode block data** - 338 blocks from `@unicode/unicode-16.0.0`

### WIP / Planned

- [ ] **Browser support** - Run in browser environment
- [ ] **Dynamic configuration**
  - [ ] Column count (characters per row)
  - [ ] Cell size (pixels per character)
  - [ ] Output format (SVG / PNG)
- [ ] **Random sampling mode** - Select random characters (excluding undefined), e.g., 30x20 grid
- [ ] **CLI mode** - Output to console with formatting
- [ ] **Function abstraction** - Export reusable functions with configurable options
- [ ] **PNG export** - Convert SVG to PNG (coordinates should be shared)

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
