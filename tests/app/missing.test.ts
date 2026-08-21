import { describe, expect, it } from "vitest";

import { missingApplication } from "@/app";
import { defineConfig, TranslationLayout } from "@/config";

describe("missingApplication", () => {
	it("finds missing and empty translations in directories layout", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const result = await missingApplication(config);

		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: "status.inactive",
					locale: "fr-FR",
					isMissing: true,
					isEmpty: false,
				}),
				expect.objectContaining({
					key: "status.active",
					locale: "fr-FR",
					isMissing: false,
					isEmpty: true,
				}),
				expect.objectContaining({
					key: "status.active",
					locale: "de-DE",
					isMissing: true,
					isEmpty: false,
				}),
				expect.objectContaining({
					key: "status.inactive",
					locale: "de-DE",
					isMissing: true,
					isEmpty: false,
				}),
			]),
		);
	});

	it("does not report completed translations in directories layout", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		});

		const result = await missingApplication(config);

		expect(
			result.issues.some(
				(issue) => issue.locale === "ar-SA" && issue.key === "status.active",
			),
		).toBe(false);
	});

	it("finds missing translations in files layout", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const result = await missingApplication(config);

		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					locale: "fr-FR",
					isMissing: true,
				}),
			]),
		);
	});
});
