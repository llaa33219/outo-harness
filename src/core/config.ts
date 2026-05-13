import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';

// Base directory for all harnesses
export const HARNESS_HOME = path.join(os.homedir(), '.agents', 'harness');

// Registry file path
export const REGISTRY_PATH = path.join(HARNESS_HOME, '.harness.json');

// Get the path for a specific harness by name
export function getHarnessPath(name: string): string {
  return path.join(HARNESS_HOME, name);
}

// Ensure the harness home directory exists
export async function ensureHarnessHome(): Promise<void> {
  await fs.mkdir(HARNESS_HOME, { recursive: true });
}

// Check if a harness directory exists
export async function harnessExists(name: string): Promise<boolean> {
  try {
    await fs.access(getHarnessPath(name));
    return true;
  } catch {
    return false;
  }
}