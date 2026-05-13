import * as fs from 'fs/promises';
import matter from 'gray-matter';

export interface HarnessMetadata {
  name: string;
  description: string;
  content: string;
  filePath: string;
}

/**
 * Parse a HARNESS.md file and extract metadata
 * @param filePath - Absolute path to HARNESS.md
 * @returns Parsed harness metadata
 * @throws Error if file doesn't exist or frontmatter is invalid
 */
export async function parseHarnessFile(filePath: string): Promise<HarnessMetadata> {
  // Read file
  const fileContent = await fs.readFile(filePath, 'utf-8');

  // Parse frontmatter
  const { data, content } = matter(fileContent);

  // Validate required fields
  if (!data.name || typeof data.name !== 'string') {
    throw new Error(`Invalid HARNESS.md at ${filePath}: missing or invalid "name" field in frontmatter`);
  }

  if (!data.description || typeof data.description !== 'string') {
    throw new Error(`Invalid HARNESS.md at ${filePath}: missing or invalid "description" field in frontmatter`);
  }

  return {
    name: data.name,
    description: data.description,
    content: content.trim(),
    filePath,
  };
}

/**
 * Check if a file is a valid HARNESS.md
 * @param filePath - Absolute path to check
 * @returns true if valid, false otherwise
 */
export async function isValidHarnessFile(filePath: string): Promise<boolean> {
  try {
    await parseHarnessFile(filePath);
    return true;
  } catch {
    return false;
  }
}