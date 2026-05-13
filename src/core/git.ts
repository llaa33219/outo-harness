import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getHarnessPath } from './config.js';

/**
 * Clone a git repository to the harness directory
 * @param url - Git repository URL
 * @param name - Harness name (directory name)
 */
export async function cloneRepo(url: string, name: string): Promise<void> {
  const dest = getHarnessPath(name);
  
  try {
    await fs.rm(dest, { recursive: true, force: true });
  } catch {}
  
  execSync(`git clone --depth 1 "${url}" "${dest}"`, {
    stdio: 'pipe',
    timeout: 60000,
  });
}

/**
 * Pull latest changes for a git repository
 * @param name - Harness name (directory name)
 */
export async function pullRepo(name: string): Promise<void> {
  const dest = getHarnessPath(name);
  
  try {
    await fs.access(path.join(dest, '.git'));
  } catch {
    throw new Error(`Harness "${name}" is not a git repository`);
  }
  
  execSync(`git -C "${dest}" pull`, {
    stdio: 'pipe',
    timeout: 30000,
  });
}

/**
 * Download an npm package and extract HARNESS.md
 * @param packageName - npm package name
 * @param name - Harness name (directory name)
 * @throws Error if package doesn't contain HARNESS.md
 */
export async function downloadNpmPackage(packageName: string, name: string): Promise<void> {
  const dest = getHarnessPath(name);
  const tempDir = path.join(dest, '.tmp');
  
  try {
    await fs.rm(dest, { recursive: true, force: true });
  } catch {}
  
  await fs.mkdir(tempDir, { recursive: true });
  
  try {
    execSync(`npm pack "${packageName}" --pack-destination "${tempDir}"`, {
      stdio: 'pipe',
      timeout: 60000,
    });
    
    const files = await fs.readdir(tempDir);
    const tarball = files.find(f => f.endsWith('.tgz'));
    if (!tarball) {
      throw new Error(`Failed to download package "${packageName}"`);
    }
    
    execSync(`tar -xzf "${path.join(tempDir, tarball)}" -C "${tempDir}"`, {
      stdio: 'pipe',
    });
    
    const extractedDir = path.join(tempDir, 'package');
    const harnessFile = path.join(extractedDir, 'harness', 'HARNESS.md');
    
    try {
      await fs.access(harnessFile);
    } catch {
      throw new Error(`Package "${packageName}" does not contain harness/HARNESS.md`);
    }
    
    await fs.mkdir(dest, { recursive: true });
    await fs.copyFile(harnessFile, path.join(dest, 'HARNESS.md'));
    
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
