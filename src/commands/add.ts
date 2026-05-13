import * as path from 'path';
import { detectSourceType } from '../core/source.js';
import { cloneRepo, downloadNpmPackage } from '../core/git.js';
import { parseHarnessFile } from '../core/parser.js';
import { addEntry, getEntry } from '../core/registry.js';
import { getHarnessPath, harnessExists } from '../core/config.js';

export async function addCommand(source: string): Promise<void> {
  try {
    const sourceInfo = detectSourceType(source);
    
    if (sourceInfo.type === 'unknown') {
      console.error(`Error: Unable to determine source type for "${source}"`);
      console.error('Supported formats:');
      console.error('  - GitHub URL: https://github.com/owner/repo');
      console.error('  - Short form: owner/repo');
      console.error('  - npm package: package-name');
      process.exit(1);
    }
    
    const existing = await getEntry(sourceInfo.name);
    if (existing) {
      console.log(`Harness "${sourceInfo.name}" is already registered.`);
      console.log(`Location: ${existing.harnessPath}`);
      console.log('');
      console.log('To update, run: npx outo-harness update');
      return;
    }
    
    console.log(`Adding harness "${sourceInfo.name}"...`);
    
    if (sourceInfo.type === 'git') {
      await cloneRepo(sourceInfo.url, sourceInfo.name);
    } else if (sourceInfo.type === 'npm') {
      await downloadNpmPackage(sourceInfo.url, sourceInfo.name);
    }
    
    const harnessPath = getHarnessPath(sourceInfo.name);
    const harnessFile = path.join(harnessPath, 'HARNESS.md');
    
    let metadata;
    try {
      metadata = await parseHarnessFile(harnessFile);
    } catch (error) {
      const fs = await import('fs/promises');
      await fs.rm(harnessPath, { recursive: true, force: true }).catch(() => {});
      
      console.error(`Error: Invalid HARNESS.md in "${source}"`);
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
    
    await addEntry({
      name: metadata.name,
      description: metadata.description,
      source: sourceInfo.url,
      type: sourceInfo.type as 'git' | 'npm',
      installedAt: new Date().toISOString(),
      harnessPath: harnessPath,
    });
    
    console.log(`✓ Harness "${metadata.name}" added successfully!`);
    console.log(`  Description: ${metadata.description}`);
    console.log(`  Location: ${harnessPath}`);
    
  } catch (error) {
    console.error(`Error adding harness:`, error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
