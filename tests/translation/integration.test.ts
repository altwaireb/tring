import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { TranslationLayout } from "@/config";

import {
	analyzeTranslations,
	createTranslationReport,
	discoverTranslationFiles,
} from "@/translation";

const I18N_DIRECTORY = join(process.cwd(), "tests", "app", "i18n");

describe("translation analysis integration", () => {
	it("handles valid translations", async () => {
		const directory = join(I18N_DIRECTORY, "valid");

		const sourceFiles = await discoverTranslationFiles({
			directory,
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: [],
		});

		const targetFiles = await discoverTranslationFiles({
			directory,
			layout: TranslationLayout.directories,
			source: "ar-SA",
			locales: [],
		});

		const analysis = await analyzeTranslations(
			"en-US",
			"ar-SA",
			sourceFiles,
			targetFiles,
		);

		const report = createTranslationReport(analysis);

		expect(report.source).toBe("en-US");
		expect(report.target).toBe("ar-SA");

		expect(report.summary.filesMissing).toBe(0);
		expect(report.summary.filesExtra).toBe(0);
		expect(report.summary.keysMissing).toBe(0);
		expect(report.summary.extraKeys).toBe(0);
	});

	it("reports missing keys", async () => {
		const directory = join(I18N_DIRECTORY, "missing-keys");

		const sourceFiles = await discoverTranslationFiles({
			directory,
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: [],
		});

		const targetFiles = await discoverTranslationFiles({
			directory,
			layout: TranslationLayout.directories,
			source: "ar-SA",
			locales: [],
		});

		const analysis = await analyzeTranslations(
			"en-US",
			"ar-SA",
			sourceFiles,
			targetFiles,
		);

		const report = createTranslationReport(analysis);

		expect(report.source).toBe("en-US");
		expect(report.target).toBe("ar-SA");

		expect(report.keys.missing).toHaveLength(2);

		expect(report.keys.missing.map((issue) => issue.key)).toEqual([
			"forgot_password",
			"create_account",
		]);

		expect(report.summary.keysMissing).toBe(2);
		expect(report.summary.extraKeys).toBe(0);
	});
});
