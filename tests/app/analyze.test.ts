import { join } from "node:path";

import { describe, expect, it } from "vitest";
import { analyzeApplication } from "@/app/analyze";
import { TranslationLayout } from "@/config";

const I18N_DIRECTORY = join(process.cwd(), "tests", "app", "i18n");

describe("analyzeApplication", () => {
	it("analyzes all configured locales", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "valid"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await analyzeApplication(config);

		expect(result.reports).toHaveLength(1);

		expect(result.reports[0]).toMatchObject({
			source: "en-US",
			target: "ar-SA",
			summary: {
				filesMissing: 0,
				filesExtra: 0,
				keysMissing: 0,
				extraKeys: 0,
			},
		});
	});

	it("analyzes only the requested locale", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "valid"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await analyzeApplication(config, {
			targetLocale: "ar-SA",
		});

		expect(result.reports).toHaveLength(1);

		expect(result.reports[0]).toMatchObject({
			source: "en-US",
			target: "ar-SA",
		});
	});

	it("reports missing keys", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "missing-keys"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await analyzeApplication(config);

		expect(result.reports).toHaveLength(1);

		expect(result.reports[0]).toMatchObject({
			source: "en-US",
			target: "ar-SA",
			keys: {
				missing: [
					{
						key: "forgot_password",
						locale: "ar-SA",
						fileKey: "auth.json",
					},
					{
						key: "create_account",
						locale: "ar-SA",
						fileKey: "auth.json",
					},
				],
				extra: [],
			},
			summary: {
				filesMissing: 0,
				filesExtra: 0,
				keysMissing: 2,
				extraKeys: 0,
			},
		});
	});

	it("reports missing files when the target locale has no files", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "missing-files"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await analyzeApplication(config);

		expect(result.reports).toHaveLength(1);

		expect(result.reports[0]).toMatchObject({
			source: "en-US",
			target: "ar-SA",

			files: {
				missing: [
					{
						locale: "en-US",
						name: "auth",
						path: join(config.directory, "en-US", "auth.json"),
					},
				],
				extra: [],
				matched: [],
			},

			keys: {
				missing: [],
				extra: [],
			},

			summary: {
				filesMissing: 1,
				filesExtra: 0,
				keysMissing: 0,
				extraKeys: 0,
			},
		});
	});
});
