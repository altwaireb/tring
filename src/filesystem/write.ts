import { writeFile } from "node:fs/promises";

export interface WriteOptions {
	flag?: string;
	mode?: number;
	encoding?: BufferEncoding | "utf8";
}

export async function write(
	path: string,
	content: string,
	options?: WriteOptions,
): Promise<void> {
	await writeFile(path, content, {
		...options,
	});
}
