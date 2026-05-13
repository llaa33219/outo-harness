export type SourceType = 'git' | 'npm' | 'unknown';

export interface SourceInfo {
  type: SourceType;
  url: string;
  name: string;
}

/**
 * Detect the type of source input
 * Supports: GitHub URLs, owner/repo format, npm package names
 */
export function detectSourceType(input: string): SourceInfo {
  // GitHub URL patterns
  const githubUrlPatterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
    /^git@github\.com:([^\/]+)\/([^\/]+?)(?:\.git)?$/,
  ];
  
  for (const pattern of githubUrlPatterns) {
    const match = input.match(pattern);
    if (match) {
      const [, owner, repo] = match;
      return {
        type: 'git',
        url: `https://github.com/${owner}/${repo}.git`,
        name: repo,
      };
    }
  }
  
  // owner/repo format
  const ownerRepoPattern = /^([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)$/;
  const ownerRepoMatch = input.match(ownerRepoPattern);
  if (ownerRepoMatch) {
    const [, owner, repo] = ownerRepoMatch;
    return {
      type: 'git',
      url: `https://github.com/${owner}/${repo}.git`,
      name: repo,
    };
  }
  
  // npm package name pattern
  const npmPattern = /^(@[a-zA-Z0-9\-_]+\/)?([a-zA-Z0-9\-_]+)$/;
  const npmMatch = input.match(npmPattern);
  if (npmMatch) {
    return {
      type: 'npm',
      url: input,
      name: npmMatch[2], // package name without scope
    };
  }
  
  return {
    type: 'unknown',
    url: input,
    name: input,
  };
}
