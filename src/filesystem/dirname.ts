import { dirname as nodeDirname } from "node:path";

export function dirname(path: string): string {
	return nodeDirname(path);
}
