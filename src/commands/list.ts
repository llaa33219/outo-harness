import * as fs from 'fs/promises';
import { loadRegistry } from '../core/registry.js';
import { harnessExists } from '../core/config.js';

export async function listCommand(): Promise<void> {
  try {
    const entries = await loadRegistry();

    if (entries.length === 0) {
      console.log('No harnesses installed.');
      console.log('');
      console.log('Use `npx outo-harness add <source>` to get started.');
      console.log('');
      console.log('Examples:');
      console.log('  npx outo-harness add owner/repo');
      console.log('  npx outo-harness add https://github.com/owner/repo');
      console.log('  npx outo-harness add npm-package-name');
      return;
    }

    console.log(`Installed harnesses (${entries.length}):`);
    console.log('');

    // Calculate column widths for alignment
    const nameWidth = Math.max(...entries.map(e => e.name.length), 4);
    const descWidth = Math.max(...entries.map(e => e.description.length), 11);

    // Header
    console.log(
      'Name'.padEnd(nameWidth) + '  ' +
      'Description'.padEnd(descWidth) + '  ' +
      'Path'
    );
    console.log(
      '-'.repeat(nameWidth) + '  ' +
      '-'.repeat(descWidth) + '  ' +
      '-'.repeat(40)
    );

    // Rows
    for (const entry of entries) {
      const exists = await harnessExists(entry.name);
      const warning = exists ? '' : ' ⚠ missing';

      console.log(
        entry.name.padEnd(nameWidth) + '  ' +
        entry.description.padEnd(descWidth) + '  ' +
        entry.harnessPath + warning
      );
    }

    // Show warnings for missing harnesses
    const missing = [];
    for (const entry of entries) {
      if (!(await harnessExists(entry.name))) {
        missing.push(entry.name);
      }
    }

    if (missing.length > 0) {
      console.log('');
      console.log(`Warning: ${missing.length} harness(es) have missing directories:`);
      for (const name of missing) {
        console.log(`  - ${name}`);
      }
      console.log('');
      console.log('Run `npx outo-harness update` to re-download missing harnesses.');
    }

  } catch (error) {
    console.error(`Error listing harnesses:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}