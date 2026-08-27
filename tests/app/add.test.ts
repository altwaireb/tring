import { describe, expect, it } from "vitest";

import { addApplication } from "@/app";
import { defineConfig, TranslationLayout } from "@/config";

describe("addApplication", () => {
	it("adds only missing translations in directories layout", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const result = await addApplication(config, {
			locale: "de-DE",
		});

		expect(result.plan.files).toEqual(
			expect.arrayContaining([
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

	it("does not include existing empty translations", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["fr-FR"],
		});

		const result = await addApplication(config, {
			locale: "fr-FR",
			file: "settings.json",
		});

		const changes = result.plan.files.flatMap((file) => file.changes);

		expect(changes.some((change) => change.key === "status.active")).toBe(
			false,
		);
	});

	it("filters by translation file", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["de-DE"],
		});

		const result = await addApplication(config, {
			locale: "de-DE",
			file: "status.json",
		});

		expect(
			result.plan.files.every((file) => file.source.key === "status.json"),
		).toBe(true);
	});

	it("adds a file to all locales and skips complete locales", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const result = await addApplication(config, {
			file: "admin/users.json",
		});

		expect(result.plan.files).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					locale: "fr-FR",
					target: expect.objectContaining({
						key: "admin/users.json",
					}),
					source: expect.objectContaining({
						key: "admin/users.json",
					}),
					changes: expect.arrayContaining([
						expect.objectContaining({
							key: "status.active",
							sourceValue: "Active",
						}),
						expect.objectContaining({
							key: "status.inactive",
							sourceValue: "Inactive",
						}),
					]),
				}),
				expect.objectContaining({
					locale: "de-DE",
					target: expect.objectContaining({
						key: "admin/users.json",
					}),
					source: expect.objectContaining({
						key: "admin/users.json",
					}),
					changes: expect.arrayContaining([
						expect.objectContaining({
							key: "status.active",
							sourceValue: "Active",
						}),
						expect.objectContaining({
							key: "status.inactive",
							sourceValue: "Inactive",
						}),
					]),
				}),
			]),
		);

		expect(result.plan.files.some((file) => file.locale === "ar-SA")).toBe(
			false,
		);

		expect(result.skippedLocales).toEqual(["ar-SA"]);
	});

	it("limits file additions to the specified locale", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const result = await addApplication(config, {
			locale: "de-DE",
			file: "admin/users.json",
		});

		expect(result.plan.files).toHaveLength(1);
		expect(result.plan.files[0]?.locale).toBe("de-DE");
		expect(result.skippedLocales).toEqual([]);
	});

	it("adds missing translations in files layout", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["fr-FR"],
		});

		const result = await addApplication(config, {
			locale: "fr-FR",
		});

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

	it("creates a plan when the target file is missing", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["de-DE"],
		});

		const result = await addApplication(config, {
			locale: "de-DE",
			file: "missing.json",
		});

		expect(result.plan.files).toEqual([]);
	});
});
