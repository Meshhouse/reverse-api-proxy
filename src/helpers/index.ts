/**
 * Convert DCC title to extension
 *
 * Can be used when you can't get extension directly
 * @param format DCC title
 */
export function slugifyToExtension(format: string): string {
  const file = format.toLowerCase();
  if (file.includes('max')) {
    return '.max';
  }
  if (file.includes('blender')) {
    return '.blend';
  }
  if (file.includes('cinema 4d')) {
    return '.c4d';
  }
  if (file.includes('maya')) {
    return '.ma';
  }

  return '.sfm';
}
