import * as fs from 'fs/promises';
import * as path from 'path';
import { REGISTRY_PATH, ensureHarnessHome } from './config.js';

export interface RegistryEntry {
  name: string;
  description: string;
  source: string;
  type: 'git' | 'npm';
  installedAt: string;
  harnessPath: string;
}

interface Registry {
  harnesses: RegistryEntry[];
}

/**
 * Load the registry from .harness.json
 * Returns empty array if file doesn't exist
 */
export async function loadRegistry(): Promise<RegistryEntry[]> {
  try {
    const data = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const registry: Registry = JSON.parse(data);
    return registry.harnesses || [];
  } catch {
    return [];
  }
}

/**
 * Save the registry to .harness.json
 * Uses atomic write (write to temp, rename)
 */
export async function saveRegistry(entries: RegistryEntry[]): Promise<void> {
  await ensureHarnessHome();

  const registry: Registry = { harnesses: entries };
  const data = JSON.stringify(registry, null, 2);

  // Atomic write: write to temp file, then rename
  const tempPath = REGISTRY_PATH + '.tmp';
  await fs.writeFile(tempPath, data, 'utf-8');
  await fs.rename(tempPath, REGISTRY_PATH);
}

/**
 * Add a new entry to the registry
 * @throws Error if entry with same name already exists
 */
export async function addEntry(entry: RegistryEntry): Promise<void> {
  const entries = await loadRegistry();

  const existing = entries.find(e => e.name === entry.name);
  if (existing) {
    throw new Error(`Harness "${entry.name}" is already registered`);
  }

  entries.push(entry);
  await saveRegistry(entries);
}

/**
 * Remove an entry from the registry by name
 * @throws Error if entry not found
 */
export async function removeEntry(name: string): Promise<void> {
  const entries = await loadRegistry();

  const index = entries.findIndex(e => e.name === name);
  if (index === -1) {
    throw new Error(`Harness "${name}" not found in registry`);
  }

  entries.splice(index, 1);
  await saveRegistry(entries);
}

/**
 * Get a single entry by name
 * @returns The entry or null if not found
 */
export async function getEntry(name: string): Promise<RegistryEntry | null> {
  const entries = await loadRegistry();
  return entries.find(e => e.name === name) || null;
}

/**
 * Update an existing entry
 * @throws Error if entry not found
 */
export async function updateEntry(name: string, updates: Partial<RegistryEntry>): Promise<void> {
  const entries = await loadRegistry();

  const index = entries.findIndex(e => e.name === name);
  if (index === -1) {
    throw new Error(`Harness "${name}" not found in registry`);
  }

  entries[index] = { ...entries[index], ...updates };
  await saveRegistry(entries);
}