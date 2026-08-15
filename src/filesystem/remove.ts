import { rm } from "node:fs/promises";

export async function remove(path: string): Promise<void> {
	await rm(path, {
		recursive: true,
		force: true,
	});
}
