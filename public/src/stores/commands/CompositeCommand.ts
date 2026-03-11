import type { Command } from './Command'

export class CompositeCommand implements Command {
  description: string

  constructor(
    private commands: Command[],
    description = 'Composite command',
  ) {
    this.description = description
  }

  execute() {
    this.commands.forEach((cmd) => cmd.execute())
  }

  undo() {
    ;[...this.commands].reverse().forEach((cmd) => cmd.undo())
  }
}
