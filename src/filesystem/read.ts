import { readFile } from "node:fs/promises";

export interface ReadOptions {
	flag?: string;
	encoding?: BufferEncoding;
}

export async function read(
	path: string,
	options?: ReadOptions,
): Promise<string> {
	return readFile(path, {
		...options,
		encoding: options?.encoding ?? "utf8",
	});
}
