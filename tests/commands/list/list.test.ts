import { describe, expect, it } from "vitest";

import { runListCommand } from "@/cli/commands/list";
import { defineConfig, TranslationLayout } from "@/config";

const config = defineConfig({
	directory: "tests/app/i18n/nested",
	layout: TranslationLayout.directories,
	source: "en-US",
	locales: ["ar-SA", "fr-FR", "de-DE"],
});

describe("list command", () => {
	it("lists translation resources", async () => {
		const result = await runListCommand(config);

		expect(result.exitCode).toBe(0);

		expect(result.result.source).toBe("en-US");

		expect(result.result.resources).toHaveLength(4);

		expect(result.result.resources.map((resource) => resource.locale)).toEqual([
			"en-US",
			"ar-SA",
			"fr-FR",
			"de-DE",
		]);

		expect(
			result.result.resources.map((resource) => ({
				locale: resource.locale,
				files: resource.files.length,
			})),
		).toEqual([
			{
				locale: "en-US",
				files: 8,
			},
			{
				locale: "ar-SA",
				files: 7,
			},
			{
				locale: "fr-FR",
				files: 6,
			},
			{
				locale: "de-DE",
				files: 4,
			},
		]);
	});

	it("discovers translation files for each locale", async () => {
		const result = await runListCommand(config);

		const source = result.result.resources.find(
			(resource) => resource.locale === "en-US",
		);

		const target = result.result.resources.find(
			(resource) => resource.locale === "ar-SA",
		);

		expect(source?.files.map((file) => file.key)).toEqual([
			"admin/roles.json",
			"admin/users.json",
			"auth.json",
			"common.json",
			"dashboard/analytics/reports.json",
			"dashboard/overview.json",
			"notifications/email.json",
			"settings.json",
		]);

		expect(target?.files.map((file) => file.key)).toEqual([
			"admin/roles.json",
			"admin/users.json",
			"auth.json",
			"common.json",
			"dashboard/overview.json",
			"notifications/email.json",
			"settings.json",
		]);
	});

	it("lists file layout resources", async () => {
		const fileConfig = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA"],
		});

		const result = await runListCommand(fileConfig);

		expect(result.exitCode).toBe(0);

		expect(result.result.source).toBe("en-US");

		expect(result.result.resources).toHaveLength(2);

		expect(
			result.result.resources.map((resource) => ({
				locale: resource.locale,
				files: resource.files.length,
			})),
		).toEqual([
			{
				locale: "en-US",
				files: 1,
			},
			{
				locale: "ar-SA",
				files: 1,
			},
		]);

		expect(
			result.result.resources.flatMap((resource) =>
				resource.files.map((file) => file.key),
			),
		).toEqual(["en-US.json", "ar-SA.json"]);
	});
});
