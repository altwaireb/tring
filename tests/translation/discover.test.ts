import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { TranslationLayout, type TringConfig } from "@/config";
import { discoverTranslationFiles } from "@/translation";

describe("discoverTranslationFiles", () => {
	it("discovers files for the source and configured locales", async () => {
		const directory = await createTempDirectory();

		try {
			await mkdir(join(directory, "en-US"));
			await mkdir(join(directory, "ar-SA"));

			await writeFile(join(directory, "en-US", "common.json"), "{}");
			await writeFile(join(directory, "ar-SA", "common.json"), "{}");

			const config: TringConfig = {
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: ["ar-SA"],
			};

			const files = await discoverTranslationFiles(config);

			expect(files.map((file) => file.locale)).toEqual(["en-US", "ar-SA"]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("discovers source files when no target locales are configured", async () => {
		const directory = await createTempDirectory();

		try {
			await mkdir(join(directory, "en-US"));

			await writeFile(join(directory, "en-US", "common.json"), "{}");

			const config: TringConfig = {
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
			};

			const files = await discoverTranslationFiles(config);

			expect(files.map((file) => file.locale)).toEqual(["en-US"]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("does not duplicate the source locale", async () => {
		const directory = await createTempDirectory();

		try {
			await mkdir(join(directory, "en-US"));
			await mkdir(join(directory, "ar-SA"));

			await writeFile(join(directory, "en-US", "common.json"), "{}");
			await writeFile(join(directory, "ar-SA", "common.json"), "{}");

			const config: TringConfig = {
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: ["en-US", "ar-SA"],
			};

			const files = await discoverTranslationFiles(config);

			expect(files.map((file) => file.locale)).toEqual(["en-US", "ar-SA"]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("discovers files according to the configured layout", async () => {
		const directory = await createTempDirectory();

		try {
			await writeFile(join(directory, "en-US.json"), "{}");
			await writeFile(join(directory, "ar-SA.json"), "{}");

			const config: TringConfig = {
				directory,
				layout: TranslationLayout.files,
				source: "en-US",
				locales: ["ar-SA"],
			};

			const files = await discoverTranslationFiles(config);

			expect(files.map((file) => file.path)).toEqual([
				join(directory, "en-US.json"),
				join(directory, "ar-SA.json"),
			]);
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
		`tring-discover-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);

	await mkdir(directory, {
		recursive: true,
	});

	return directory;
}
