import { Command } from 'commander';
import { addCommand } from './commands/add.js';
import { updateCommand } from './commands/update.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program
  .name('outo-harness')
  .description('Agent harness preset manager for effective harness engineering')
  .version('1.0.0');

// Add command
program
  .command('add <source> [harness-name]')
  .description('Add a harness from a GitHub repository or npm package')
  .action(addCommand);

// Update command
program
  .command('update')
  .description('Update all registered harnesses')
  .action(updateCommand);

// List command
program
  .command('list')
  .description('List all registered harnesses')
  .action(listCommand);

program.parse();