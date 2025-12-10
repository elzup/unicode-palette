import { defineCommand } from 'citty'
import { renderScriptTilesToFile } from '../../node-io'

export const tilesCommand = defineCommand({
  meta: {
    name: 'tiles',
    description: 'Generate Unicode script tiles as SVG',
  },
  args: {
    output: {
      type: 'string',
      alias: 'o',
      description: 'Output file path',
      required: true,
    },
    cols: {
      type: 'string',
      alias: 'c',
      description: 'Number of tile columns',
      default: '8',
    },
    'cell-size': {
      type: 'string',
      description: 'Cell size in pixels',
      default: '32',
    },
    'bmp-only': {
      type: 'boolean',
      description: 'Only include BMP blocks',
      default: true,
    },
  },
  run({ args }) {
    const cols = parseInt(args.cols, 10)
    const cellSize = parseInt(args['cell-size'], 10)

    renderScriptTilesToFile(args.output, {
      cols,
      cellSize,
      bmpOnly: args['bmp-only'],
    })
  },
})
