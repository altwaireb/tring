import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { readTranslationFile } from "@/translation";

describe("readTranslationFile", () => {
	it("reads a valid translation file", async () => {
		const directory = await createTempDirectory();
		const path = join(directory, "common.json");

		try {
			await writeFile(
				path,
				JSON.stringify({
					welcome: "Welcome",
					auth: {
						login: "Login",
					},
				}),
			);

			const file = {
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				path,
				key: "common.json",
				isLocaleFile: false,
			};

			const document = await readTranslationFile(file);

			expect(document).toEqual({
				file,
				data: {
					welcome: "Welcome",
					auth: {
						login: "Login",
					},
				},
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("rejects a valid JSON array", async () => {
		const directory = await createTempDirectory();
		const path = join(directory, "common.json");

		try {
			await writeFile(path, JSON.stringify(["Welcome", "Login"]));

			const file = {
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				path,
				key: "common.json",
				isLocaleFile: false,
			};

			await expect(readTranslationFile(file)).rejects.toThrow(
				`Translation file must contain a JSON object: ${path}`,
			);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("rejects a valid JSON primitive", async () => {
		const directory = await createTempDirectory();
		const path = join(directory, "common.json");

		try {
			await writeFile(path, JSON.stringify("Welcome"));

			const file = {
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				path,
				key: "common.json",
				isLocaleFile: false,
			};

			await expect(readTranslationFile(file)).rejects.toThrow(
				`Translation file must contain a JSON object: ${path}`,
			);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("rejects invalid JSON", async () => {
		const directory = await createTempDirectory();
		const path = join(directory, "common.json");

		try {
			await writeFile(path, '{"welcome": "Welcome"');

			const file = {
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				path,
				key: "common.json",
				isLocaleFile: false,
			};

			await expect(readTranslationFile(file)).rejects.toThrow();
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});
});

async function createTempDirectory(): Promise<string> {
	const directory = join(
		tmpdir(),
		`tring-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);

	await mkdir(directory, {
		recursive: true,
	});

	return directory;
}
