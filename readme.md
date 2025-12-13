# unicode-palette

Unicode character visualization tool - Generate grid-based character maps as SVG/PNG.

```bash
$ npx unicode-palette random Box_Drawing -s 5x5
╊┸┱┷╏
┋┥┐┑┳
╆╫┵╾┫
┽═╔╛┧
┖╈╨│┎

$ npx unicode-palette print 25E7-25FB
◧◨◩◪◫◬◭◮◯◰◱◲◳◴◵◶◷◸◹◺◻

$ npx unicode-palette print 0041-005A -c 8
ABCDEFGH
IJKLMNOP
QRSTUVWX
YZ
```

## Unicode Block Data Usage

This repository includes pre-generated Unicode block data (Unicode 16.0.0, 338 blocks) that can be used directly:

| File                                                               | Description                              |
| ------------------------------------------------------------------ | ---------------------------------------- |
| [data/unicode-blocks.json](data/unicode-blocks.json)               | Full block data with ranges              |
| [data/unicode-blocks.csv](data/unicode-blocks.csv)                 | Tabular format for spreadsheets/analysis |
| [data/unicode-blocks.schema.json](data/unicode-blocks.schema.json) | JSON Schema for validation               |

Each block includes: name, display name, code point range, defined/unassigned counts, and character ranges.

### Sample schema

```
{
  "version": "17.0.0",
  "generatedAt": "2025-12-12T04:06:38.250Z",
  "totalBlocks": 346,
  "bmpBlocks": 164,
  "blocks": [
    {
      "name": "Basic_Latin",
      "displayName": "Basic Latin",
      "blockStart": 0,
      "blockEnd": 127,
      "definedCount": 128,
      "unassignedCount": 0,
      "ranges": [{ "start": 0, "end": 127 }]
    }
    /* ... */,
    {
      "name": "Armenian",
      "displayName": "Armenian",
      "blockStart": 1328,
      "blockEnd": 1423,
      "definedCount": 91,
      "unassignedCount": 5,
      "ranges": [
        { "start": 1329, "end": 1366 },
        { "start": 1369, "end": 1418 },
        { "start": 1421, "end": 1423 }
      ]
    }
     /* ... */ ]}
```

### Example Usage

```rb
require 'json'
data = JSON.parse(File.read('data/unicode-blocks.json'))
block = data['blocks'].find{|b| b['name']=='Bopomofo'}

# filter out unassigned
puts block['ranges'].flat_map{|r| (r['start']..r['end']).to_a}.first(20).pack('U*')
# ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘ

# without skipping unassigned
puts (0...20).map{|i| (block['blockStart']+i).chr('UTF-8')}.join
# ㄀㄁㄂㄃㄄ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓ
#  Note:  ㄀~㄄ are unassigned
```


```sh
$ jq -r '.blocks[] | select(.name=="Tifinagh") | [range(.blockStart; .blockStart+20)] | implode' unicode-blocks.json
ⴰⴱⴲⴳⴴⴵⴶⴷⴸⴹⴺⴻⴼⴽⴾⴿⵀⵁⵂⵃ

$ jq -r '.blocks[] | select(.name=="Superscripts_And_Subscripts") | [.ranges[] | range(.start; .end+1)] | .[:20] | implode' data/unicode-blocks.json
⁰ⁱ⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ₀₁₂₃₄₅
```


```js
const data = require('./data/unicode-blocks.json')
const block = data.blocks.find(b => b.name === 'Greek_And_Coptic')
const toChar = cp => String.fromCodePoint(cp)
const range = (n) => [...Array(n).keys()]

// Using ranges: only defined characters (no holes)
block.ranges.flatMap(r => range(r.end - r.start + 1)).slice(0, 20)
  .map(i => toChar(r.start + i)).join('')
// ͰͱͲͳʹ͵Ͷͷͺͻͼͽ;Ϳ΄΅Ά·ΈΉ

// Simple: from blockStart (may include unassigned holes)
range(20).map(i => toChar(block.blockStart + i)).join('')
// ͰͱͲͳʹ͵Ͷͷ͸͹ͺͻͼͽ;Ϳ΀΁΂΃

```

## Install

```bash
npm install unicode-palette
```

## CLI

```bash
# Print to console (default: U+0000-00FF)
unicode-palette print

# Print specific range
unicode-palette print 3040-309F

# Print by block name
unicode-palette print Hiragana

# Output to file (auto-detect format by extension)
unicode-palette print 0000-00FF -o output.svg
unicode-palette print 0000-00FF -o output.png -f /path/to/font.otf

# With options
unicode-palette print 0000-00FF -c 32 -b  # 32 cols, with background colors

# List available block names
unicode-palette print --list

# Generate script tiles
unicode-palette tiles -o tiles.svg -c 8

# Random characters from BMP
unicode-palette random -s 16x10

# Random from specific block
unicode-palette random Hiragana -s 8x3

# Print specific hex range (subset of block)
unicode-palette print 25E7-25FB  # ◧◨◩◪◫◬◭◮◯◰◱◲◳◴◵◶◷◸◹◺◻◼◽◾◿
```

### Example Output

```
$ unicode-palette print 3040-309F
 ぁあぃいぅうぇえぉおかがきぎく
ぐけげこごさざしじすずせぜそぞた
だちぢっつづてでとどなにぬねのは
ばぱひびぴふぶぷへべぺほぼぽまみ
むめもゃやゅゆょよらりるれろゎわ
ゐゑをんゔゕゖ  ゙゚゛゜ゝゞゟ

$ unicode-palette print Hiragana -c 10
 ぁあぃいぅうぇえぉ
おかがきぎくぐけげこ
ごさざしじすずせぜそ
ぞただちぢっつづてで
とどなにぬねのはばぱ
ひびぴふぶぷへべぺほ
ぼぽまみむめもゃやゅ
ゆょよらりるれろゎわ
ゐゑをんゔゕゖ  ゙

$ unicode-palette random Katakana -s 10x3
ゲモッヅザホナヸバィ
クゴ゠ボカパヶシラチ
セニズコーヤゥハビゼ

$ unicode-palette random Greek_And_Coptic -s 12x2
ϷϰΖλͺζσϦϩϭϔϖ
ͽΌϲΘϕυʹώϞϸϚϋ

$ unicode-palette random Cyrillic -s 12x2
РӨљңѽнҠЃҗҍцҹ
ӹ҂їӋѮҬҌѡүБяҽ

$ unicode-palette random Arabic -s 12x2
؋ٱثڔ۳يٕڨۈگۅؒ
ۙضؔؾۚ۷ُڏڢ؟ٍخ

$ unicode-palette random Hebrew -s 12x2
ְ֣ה֮׳֘ב֢װֿעּ
ׁׅכח֖שךרץׇ֥֚

$ unicode-palette random Devanagari -s 12x2
कक़टऺध॑१ऽॡएॺ८
स७ह२९ॾ॰ॎजॲऱऎ

$ unicode-palette random Thai -s 12x2
๎ฝบมฤ๑ฐโฯฏใๆ
้ชฬดุไ็๖ธสเถ

$ unicode-palette random Hangul_Syllables -s 12x2
펴쉒곦뫪쯵꾦걔댵젉큥퉆붂
풧쎖쩔쉞속븈걭뎇덣횽꼃빜

$ unicode-palette random CJK_Unified_Ideographs -s 12x2
廂芓鯙蜿鬯瀒燙韔琧蕖皳邴
瓜鐺茯弆堇巿敪雀砠藫鈶稶

$ unicode-palette random Ethiopic -s 12x2
ኁጞቝኧሮጬኩጐኢቆዝሣ
ቧ፮ዅዀጇጡሲደሊሬሀጶ

$ unicode-palette random Georgian -s 12x2
სႯႻႲქႳჀႽႥჽჲც
ႠႡႿჳჵპმჇნკშუ
```

## Font Setup (for PNG output)

A font file is required for PNG output. GNU Unifont is recommended for consistent Unicode character display.

```bash
# Download GNU Unifont
bash scripts/setup-font.sh

# Or download manually from:
# https://unifoundry.com/pub/unifont/
```

Usage with PNG output:

```bash
unicode-palette print 0000-00FF -o output.png -f ./fonts/unifont.otf
```

Note: SVG output does not require a local font file (font is embedded via URL).

## Architecture

```
data/
  unicode-blocks.json       # Single source of truth (338 blocks with ranges)
  unicode-blocks.csv        # CSV export
  unicode-blocks.schema.json # JSON Schema
src/
  index.ts                  # Main exports (browser compatible)
  node.ts                   # Node.js exports (file I/O + canvas)
  cli/                      # CLI commands
  core/                     # Unicode blocks, category detection
  render/                   # SVG/character generation
  node-io/                  # File I/O, PNG generation
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

// Script tiles (4x1 per block)
const tiles = generateScriptTilesSvg({
  cellSize: 32,
  cols: 8,
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
pnpm generate:data
```

## References

- [GNU Unifont](https://unifoundry.com/unifont/)
- [@unicode/unicode-17.0.0](https://www.npmjs.com/package/@unicode/unicode-17.0.0)
- [ISO 15924 (Scripts)](https://unicode.org/iso15924/)
- [Unicode Character Database](https://www.unicode.org/ucd/)

## Script Tiles Preview

![Script Tiles](output/script-tiles.svg)

## License

MIT © [anozon](https://anozon.me)
