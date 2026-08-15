import { readdir as readDirectory } from "node:fs/promises";

export async function readdir(path: string): Promise<string[]> {
	return readDirectory(path, {
		encoding: "utf8",
	});
}

export async function readdirWithFileTypes(path: string) {
	return readDirectory(path, {
		encoding: "utf8",
		withFileTypes: true,
	});
}
