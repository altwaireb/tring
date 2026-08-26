import { describe, expect, it } from "vitest";

import { syncApplication } from "@/app";
import { defineConfig, TranslationLayout } from "@/config";

describe("syncApplication", () => {
	it("finds missing and empty translations in directories layout", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const result = await syncApplication(config);

		expect(result.plan.files).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					locale: "fr-FR",
					source: expect.objectContaining({
						key: expect.any(String),
					}),
					changes: expect.arrayContaining([
						expect.objectContaining({
							key: "status.active",
							sourceValue: expect.any(String),
						}),
					]),
				}),
				expect.objectContaining({
					locale: "de-DE",
					changes: expect.arrayContaining([
						expect.objectContaining({
							key: "status.active",
							sourceValue: expect.any(String),
						}),
						expect.objectContaining({
							key: "status.inactive",
							sourceValue: expect.any(String),
						}),
					]),
				}),
			]),
		);
	});

	it("finds missing translations in files layout", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const result = await syncApplication(config);

		expect(result.plan.files).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					locale: "fr-FR",
					changes: expect.arrayContaining([
						expect.objectContaining({
							sourceValue: expect.any(String),
						}),
					]),
				}),
			]),
		);
	});

	it("includes all source keys when a target file is missing", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["de-DE"],
		});

		const result = await syncApplication(config);

		const missingFile = result.plan.files.find(
			(file) => file.locale === "de-DE" && file.target === undefined,
		);

		expect(missingFile).toBeDefined();
		expect(missingFile?.changes.length).toBeGreaterThan(0);
	});
});
