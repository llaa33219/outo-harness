import * as path from 'path';
import { loadRegistry, updateEntry } from '../core/registry.js';
import { pullRepo, downloadNpmPackage } from '../core/git.js';
import { parseHarnessFile } from '../core/parser.js';
import { getHarnessPath } from '../core/config.js';

export async function updateCommand(): Promise<void> {
  try {
    const entries = await loadRegistry();
    
    if (entries.length === 0) {
      console.log('No harnesses installed.');
      console.log('Use `npx outo-harness add <source>` to get started.');
      return;
    }
    
    console.log(`Updating ${entries.length} harness(es)...`);
    console.log('');
    
    let updated = 0;
    let failed = 0;
    
    for (const entry of entries) {
      try {
        console.log(`Updating "${entry.name}"...`);
        
        if (entry.type === 'git') {
          await pullRepo(entry.name);
        } else if (entry.type === 'npm') {
          await downloadNpmPackage(entry.source, entry.name);
        }
        
        const harnessFile = path.join(getHarnessPath(entry.name), 'HARNESS.md');
        const metadata = await parseHarnessFile(harnessFile);
        
        if (metadata.description !== entry.description) {
          await updateEntry(entry.name, {
            description: metadata.description,
          });
        }
        
        console.log(`  ✓ "${entry.name}" updated`);
        updated++;
        
      } catch (error) {
        console.error(`  ✗ Failed to update "${entry.name}":`, error instanceof Error ? error.message : String(error));
        failed++;
      }
    }
    
    console.log('');
    console.log(`Update complete: ${updated} updated, ${failed} failed`);
    
    if (failed > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`Error updating harnesses:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
