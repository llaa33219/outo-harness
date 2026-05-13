import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const TEST_HARNESS_HOME = path.join(os.tmpdir(), 'outo-harness-test-' + Date.now());
const TEST_REGISTRY_PATH = path.join(TEST_HARNESS_HOME, '.harness.json');

vi.mock('../../src/core/config.js', () => ({
  HARNESS_HOME: TEST_HARNESS_HOME,
  REGISTRY_PATH: TEST_REGISTRY_PATH,
  ensureHarnessHome: async () => {
    await fs.mkdir(TEST_HARNESS_HOME, { recursive: true });
  },
  getHarnessPath: (name: string) => path.join(TEST_HARNESS_HOME, name),
  harnessExists: async (name: string) => {
    try {
      await fs.access(path.join(TEST_HARNESS_HOME, name));
      return true;
    } catch {
      return false;
    }
  },
}));

const { loadRegistry, saveRegistry, addEntry, removeEntry, getEntry } = await import('../../src/core/registry.js');
import type { RegistryEntry } from '../../src/core/registry.js';

describe('registry', () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_HARNESS_HOME, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_HARNESS_HOME, { recursive: true, force: true }).catch(() => {});
  });

  it('should return empty array when registry does not exist', async () => {
    const entries = await loadRegistry();
    expect(entries).toEqual([]);
  });

  it('should save and load registry', async () => {
    const entries: RegistryEntry[] = [
      {
        name: 'test',
        description: 'Test harness',
        source: 'https://github.com/test/test.git',
        type: 'git',
        installedAt: new Date().toISOString(),
        harnessPath: '/path/to/test',
      },
    ];

    await saveRegistry(entries);
    const loaded = await loadRegistry();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('test');
  });

  it('should add entry to registry', async () => {
    const entry: RegistryEntry = {
      name: 'test',
      description: 'Test harness',
      source: 'https://github.com/test/test.git',
      type: 'git',
      installedAt: new Date().toISOString(),
      harnessPath: '/path/to/test',
    };

    await addEntry(entry);
    const entries = await loadRegistry();

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('test');
  });

  it('should throw error when adding duplicate entry', async () => {
    const entry: RegistryEntry = {
      name: 'test',
      description: 'Test harness',
      source: 'https://github.com/test/test.git',
      type: 'git',
      installedAt: new Date().toISOString(),
      harnessPath: '/path/to/test',
    };

    await addEntry(entry);
    await expect(addEntry(entry)).rejects.toThrow('already registered');
  });

  it('should remove entry from registry', async () => {
    const entry: RegistryEntry = {
      name: 'test',
      description: 'Test harness',
      source: 'https://github.com/test/test.git',
      type: 'git',
      installedAt: new Date().toISOString(),
      harnessPath: '/path/to/test',
    };

    await addEntry(entry);
    await removeEntry('test');
    const entries = await loadRegistry();

    expect(entries).toHaveLength(0);
  });

  it('should throw error when removing nonexistent entry', async () => {
    await expect(removeEntry('nonexistent')).rejects.toThrow('not found');
  });

  it('should get entry by name', async () => {
    const entry: RegistryEntry = {
      name: 'test',
      description: 'Test harness',
      source: 'https://github.com/test/test.git',
      type: 'git',
      installedAt: new Date().toISOString(),
      harnessPath: '/path/to/test',
    };

    await addEntry(entry);
    const result = await getEntry('test');

    expect(result).not.toBeNull();
    expect(result?.name).toBe('test');
  });

  it('should return null for nonexistent entry', async () => {
    const result = await getEntry('nonexistent');
    expect(result).toBeNull();
  });
});
