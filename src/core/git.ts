import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getHarnessPath } from './config.js';

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

export async function listHarnessesInRepo(url: string): Promise<string[]> {
  const tempDir = path.join(getHarnessPath('.tmp-list'), Date.now().toString());
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    execSync(`git clone --depth 1 "${url}" "${tempDir}"`, {
      stdio: 'pipe',
      timeout: 60000,
    });
    
    const harnessDir = path.join(tempDir, 'harness');
    try {
      await fs.access(harnessDir);
    } catch {
      return [];
    }
    
    const entries = await fs.readdir(harnessDir, { withFileTypes: true });
    const harnesses: string[] = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const harnessFile = path.join(harnessDir, entry.name, 'HARNESS.md');
        try {
          await fs.access(harnessFile);
          harnesses.push(entry.name);
        } catch {}
      }
    }
    
    return harnesses;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function cloneHarnessFromRepo(url: string, harnessName: string, destName: string): Promise<void> {
  const tempDir = path.join(getHarnessPath('.tmp-clone'), Date.now().toString());
  const dest = getHarnessPath(destName);
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    execSync(`git clone --depth 1 "${url}" "${tempDir}"`, {
      stdio: 'pipe',
      timeout: 60000,
    });
    
    const harnessFile = path.join(tempDir, 'harness', harnessName, 'HARNESS.md');
    try {
      await fs.access(harnessFile);
    } catch {
      throw new Error(`Harness "${harnessName}" not found in repository`);
    }
    
    await fs.rm(dest, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(dest, { recursive: true });
    await fs.copyFile(harnessFile, path.join(dest, 'HARNESS.md'));
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

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
