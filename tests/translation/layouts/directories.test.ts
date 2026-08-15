import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { directoriesLayout } from "@/translation/layouts";

describe("directoriesLayout", () => {
	it("resolves a locale to its directory", async () => {
		const directory = await createTempDirectory();

		try {
			const locale = directoriesLayout.resolveLocale(directory, "ar-SA");

			expect(locale).toEqual({
				locale: "ar-SA",
				path: join(directory, "ar-SA"),
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("discovers JSON translation files", async () => {
		const directory = await createTempDirectory();

		try {
			const localeDirectory = join(directory, "ar-SA");

			await mkdir(localeDirectory);

			await writeFile(join(localeDirectory, "common.json"), "{}");

			await writeFile(join(localeDirectory, "auth.json"), "{}");

			const locale = directoriesLayout.resolveLocale(directory, "ar-SA");
			const files = await directoriesLayout.discoverFiles(locale);

			expect(files).toEqual([
				{
					locale: "ar-SA",
					directory: "",
					name: "auth",
					filename: "auth.json",
					key: "auth.json",
					isLocaleFile: false,
					path: join(localeDirectory, "auth.json"),
				},
				{
					locale: "ar-SA",
					directory: "",
					name: "common",
					filename: "common.json",
					key: "common.json",
					isLocaleFile: false,
					path: join(localeDirectory, "common.json"),
				},
			]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("ignores non-JSON files", async () => {
		const directory = await createTempDirectory();

		try {
			const localeDirectory = join(directory, "ar-SA");

			await mkdir(localeDirectory);

			await writeFile(join(localeDirectory, "common.json"), "{}");

			await writeFile(join(localeDirectory, "README.md"), "# README");

			await writeFile(join(localeDirectory, "notes.txt"), "notes");

			const locale = directoriesLayout.resolveLocale(directory, "ar-SA");
			const files = await directoriesLayout.discoverFiles(locale);

			expect(files).toEqual([
				{
					locale: "ar-SA",
					directory: "",
					name: "common",
					filename: "common.json",
					key: "common.json",
					isLocaleFile: false,
					path: join(localeDirectory, "common.json"),
				},
			]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("sorts translation files by name", async () => {
		const directory = await createTempDirectory();

		try {
			const localeDirectory = join(directory, "ar-SA");

			await mkdir(localeDirectory);

			await writeFile(join(localeDirectory, "settings.json"), "{}");

			await writeFile(join(localeDirectory, "auth.json"), "{}");

			await writeFile(join(localeDirectory, "common.json"), "{}");

			const locale = directoriesLayout.resolveLocale(directory, "ar-SA");
			const files = await directoriesLayout.discoverFiles(locale);

			expect(files.map((file) => file.name)).toEqual([
				"auth",
				"common",
				"settings",
			]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("returns no files for an empty locale directory", async () => {
		const directory = await createTempDirectory();

		try {
			const localeDirectory = join(directory, "ar-SA");

			await mkdir(localeDirectory);

			const locale = directoriesLayout.resolveLocale(directory, "ar-SA");
			const files = await directoriesLayout.discoverFiles(locale);

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
		`tring-directories-layout-${Date.now()}-${Math.random()
			.toString(36)
			.slice(2)}`,
	);

	await mkdir(directory, {
		recursive: true,
	});

	return directory;
}
