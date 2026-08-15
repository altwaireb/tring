import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { TranslationLayout } from "@/config";

import {
	analyzeTranslations,
	createTranslationReport,
	discoverTranslationFiles,
	formatTranslationReport,
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

		const output = formatTranslationReport(report);

		expect(output).toBe(
			[
				"Translation Analysis",
				"",
				"Source: en-US",
				"Target: ar-SA",
				"",
				"Summary",
				"  Files missing: 0",
				"  Files extra: 0",
				"  Keys missing: 0",
				"  Extra keys: 0",
			].join("\n"),
		);
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

		const output = formatTranslationReport(report);

		expect(output).toBe(
			[
				"Translation Analysis",
				"",
				"Source: en-US",
				"Target: ar-SA",
				"",
				"Keys Missing",
				"  ✗ forgot_password | ar-SA | auth.json",
				"  ✗ create_account | ar-SA | auth.json",
				"",
				"Summary",
				"  Files missing: 0",
				"  Files extra: 0",
				"  Keys missing: 2",
				"  Extra keys: 0",
			].join("\n"),
		);
	});
});
