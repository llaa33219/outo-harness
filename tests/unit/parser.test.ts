import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { parseHarnessFile, isValidHarnessFile } from '../../src/core/parser.js';

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

describe('parser', () => {
  describe('parseHarnessFile', () => {
    it('should parse valid HARNESS.md with frontmatter', async () => {
      const filePath = path.join(FIXTURES_DIR, 'valid-harness', 'HARNESS.md');
      const result = await parseHarnessFile(filePath);

      expect(result.name).toBe('test-harness');
      expect(result.description).toBe('A test harness for unit testing');
      expect(result.content).toContain('# Test Harness');
      expect(result.filePath).toBe(filePath);
    });

    it('should throw error for missing file', async () => {
      const filePath = path.join(FIXTURES_DIR, 'nonexistent', 'HARNESS.md');
      await expect(parseHarnessFile(filePath)).rejects.toThrow();
    });

    it('should throw error for invalid frontmatter (missing name)', async () => {
      const filePath = path.join(FIXTURES_DIR, 'invalid-harness', 'HARNESS.md');
      await expect(parseHarnessFile(filePath)).rejects.toThrow('missing or invalid "name"');
    });
  });

  describe('isValidHarnessFile', () => {
    it('should return true for valid HARNESS.md', async () => {
      const filePath = path.join(FIXTURES_DIR, 'valid-harness', 'HARNESS.md');
      const result = await isValidHarnessFile(filePath);
      expect(result).toBe(true);
    });

    it('should return false for invalid HARNESS.md', async () => {
      const filePath = path.join(FIXTURES_DIR, 'invalid-harness', 'HARNESS.md');
      const result = await isValidHarnessFile(filePath);
      expect(result).toBe(false);
    });

    it('should return false for nonexistent file', async () => {
      const filePath = path.join(FIXTURES_DIR, 'nonexistent', 'HARNESS.md');
      const result = await isValidHarnessFile(filePath);
      expect(result).toBe(false);
    });
  });
});
