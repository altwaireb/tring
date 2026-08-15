import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { filesLayout } from "@/translation/layouts";

describe("filesLayout", () => {
	it("resolves a locale to its JSON file", async () => {
		const directory = await createTempDirectory();

		try {
			const locale = filesLayout.resolveLocale(directory, "ar-SA");

			expect(locale).toEqual({
				locale: "ar-SA",
				path: join(directory, "ar-SA.json"),
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("discovers an existing locale file", async () => {
		const directory = await createTempDirectory();

		try {
			const path = join(directory, "ar-SA.json");

			await writeFile(path, "{}");

			const locale = filesLayout.resolveLocale(directory, "ar-SA");
			const files = await filesLayout.discoverFiles(locale);

			expect(files).toEqual([
				{
					locale: "ar-SA",
					directory: "",
					name: "locale",
					filename: "ar-SA.json",
					key: "ar-SA.json",
					isLocaleFile: true,
					path,
				},
			]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("returns no files when the locale file does not exist", async () => {
		const directory = await createTempDirectory();

		try {
			const locale = filesLayout.resolveLocale(directory, "ar-SA");
			const files = await filesLayout.discoverFiles(locale);

			expect(files).toEqual([]);
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
		`tring-files-layout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);

	await mkdir(directory, {
		recursive: true,
	});

	return directory;
}
