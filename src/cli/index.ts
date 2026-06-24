#!/usr/bin/env node
import { version } from '../../package.json'
import { printCommand } from './commands/print'
import { randomCommand } from './commands/random'
import type { Command } from './types'

const commands: Command[] = [printCommand, randomCommand]

function printHelp() {
  const list = commands
    .map((c) => `  ${c.name.padEnd(8)} ${c.description}`)
    .join('\n')
  console.log(`unicode-palette v${version}
Unicode character visualization tool

Usage: unicode-palette <command> [options]

Commands:
${list}

Run 'unicode-palette <command> --help' for command details.`)
}

function main() {
  const [cmdName, ...rest] = process.argv.slice(2)

  if (!cmdName || cmdName === '--help' || cmdName === '-h') {
    printHelp()
    return
  }

  if (cmdName === '--version' || cmdName === '-v') {
    console.log(version)
    return
  }

  const command = commands.find((c) => c.name === cmdName)
  if (!command) {
    console.error(`Unknown command: ${cmdName}\n`)
    printHelp()
    process.exit(1)
  }

  try {
    command.run(rest)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
