import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export function toFileUrl(p: string) {
  return pathToFileURL(path.resolve(p)).href;
}
