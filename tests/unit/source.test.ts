import { describe, it, expect } from 'vitest';
import { detectSourceType } from '../../src/core/source.js';

describe('source', () => {
  describe('detectSourceType', () => {
    it('should detect GitHub HTTPS URL', () => {
      const result = detectSourceType('https://github.com/owner/repo');
      expect(result.type).toBe('git');
      expect(result.url).toBe('https://github.com/owner/repo.git');
      expect(result.name).toBe('repo');
    });

    it('should detect GitHub HTTPS URL with .git suffix', () => {
      const result = detectSourceType('https://github.com/owner/repo.git');
      expect(result.type).toBe('git');
      expect(result.url).toBe('https://github.com/owner/repo.git');
      expect(result.name).toBe('repo');
    });

    it('should detect GitHub SSH URL', () => {
      const result = detectSourceType('git@github.com:owner/repo.git');
      expect(result.type).toBe('git');
      expect(result.url).toBe('https://github.com/owner/repo.git');
      expect(result.name).toBe('repo');
    });

    it('should detect owner/repo format', () => {
      const result = detectSourceType('owner/repo');
      expect(result.type).toBe('git');
      expect(result.url).toBe('https://github.com/owner/repo.git');
      expect(result.name).toBe('repo');
    });

    it('should detect npm package name', () => {
      const result = detectSourceType('my-package');
      expect(result.type).toBe('npm');
      expect(result.url).toBe('my-package');
      expect(result.name).toBe('my-package');
    });

    it('should detect scoped npm package', () => {
      const result = detectSourceType('@scope/my-package');
      expect(result.type).toBe('npm');
      expect(result.url).toBe('@scope/my-package');
      expect(result.name).toBe('my-package');
    });

    it('should return unknown for invalid input', () => {
      const result = detectSourceType('invalid input with spaces');
      expect(result.type).toBe('unknown');
    });
  });
});
