import { mkdir as createDirectory } from "node:fs/promises";

export async function mkdir(path: string): Promise<void> {
	await createDirectory(path, {
		recursive: true,
	});
}
