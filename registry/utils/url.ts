export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:", "mailto:"].includes(parsedUrl.protocol)) {
      return "https://";
    }
    return url;
  } catch {
    return "https://";
  }
}
