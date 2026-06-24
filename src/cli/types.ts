export type Command = {
  name: string
  description: string
  help: string
  run: (argv: string[]) => void
}
