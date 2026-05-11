const DEFAULT_SERVER_URL = "http://localhost:7860";


export function getServerUrl(): string {
  return DEFAULT_SERVER_URL;
}


export function buildServerUrl(path: string): string {
  const baseUrl = getServerUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
