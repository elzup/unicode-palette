#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { printCommand } from './commands/print'
import { randomCommand } from './commands/random'

const main = defineCommand({
  meta: {
    name: 'unicode-palette',
    version: '0.0.0',
    description: 'Unicode character visualization tool',
  },
  subCommands: {
    print: printCommand,
    random: randomCommand,
  },
})

runMain(main)
