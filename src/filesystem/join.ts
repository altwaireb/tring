import { join as nodeJoin } from "node:path";

export function join(...paths: string[]): string {
	return nodeJoin(...paths);
}
