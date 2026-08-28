import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { checkApplication } from "@/app/check";
import { TranslationLayout } from "@/config";

const I18N_DIRECTORY = join(process.cwd(), "tests", "app", "i18n");

function createConfig(directory: string) {
	return {
		directory: join(I18N_DIRECTORY, directory),
		layout: TranslationLayout.directories,
		source: "en-US",
		locales: ["ar-SA"],
	};
}

describe("checkApplication", () => {
	it("passes when translations are complete, non-empty, and sorted", async () => {
		const result = await checkApplication(createConfig("valid"));

		expect(result.exitCode).toBe(0);
		expect(result.issues).toEqual([]);
	});

	it("detects missing files", async () => {
		const result = await checkApplication(createConfig("missing-files"));

		expect(result.exitCode).toBe(1);
		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "missing-file",
					locale: "ar-SA",
					file: "settings.json",
				}),
			]),
		);
	});

	it("detects extra files", async () => {
		const result = await checkApplication(createConfig("extra-files"));

		expect(result.exitCode).toBe(1);
		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "extra-file",
					locale: "ar-SA",
					file: "extra.json",
				}),
			]),
		);
	});

	it("detects missing keys", async () => {
		const result = await checkApplication(createConfig("missing-keys"));

		expect(result.exitCode).toBe(1);
		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "missing-key",
					locale: "ar-SA",
					file: "auth.json",
					key: "forgot_password",
				}),
				expect.objectContaining({
					type: "missing-key",
					locale: "ar-SA",
					file: "auth.json",
					key: "create_account",
				}),
			]),
		);
	});

	it("detects extra keys", async () => {
		const result = await checkApplication(createConfig("extra-keys"));

		expect(result.exitCode).toBe(1);
		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "extra-key",
					locale: "ar-SA",
					file: "auth.json",
					key: "extra_key",
				}),
			]),
		);
	});

	it("detects empty values", async () => {
		const result = await checkApplication(createConfig("empty-values"));

		expect(result.exitCode).toBe(1);
		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "empty-value",
					locale: "ar-SA",
					file: "auth.json",
					key: "login_button",
				}),
			]),
		);
	});

	it("detects unsorted keys", async () => {
		const result = await checkApplication(createConfig("unsorted"));

		expect(result.exitCode).toBe(1);
		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "unsorted",
					locale: "ar-SA",
					file: "auth.json",
				}),
			]),
		);
	});

	it("skips empty-value checks when requested", async () => {
		const result = await checkApplication(createConfig("empty-values"), {
			skipEmpty: true,
		});

		expect(result.exitCode).toBe(0);
		expect(result.issues).toEqual([]);
	});

	it("skips sorting checks when requested", async () => {
		const result = await checkApplication(createConfig("unsorted"), {
			skipSort: true,
		});

		expect(result.exitCode).toBe(0);
		expect(result.issues).toEqual([]);
	});

	it("does not report missing keys for a missing file", async () => {
		const result = await checkApplication(createConfig("missing-files"));

		const fileIssues = result.issues.filter(
			(issue) => issue.type === "missing-key" && issue.file === "settings.json",
		);

		expect(fileIssues).toEqual([]);
	});

	it("passes when translations are complete, non-empty, and sorted", async () => {
		const result = await checkApplication(createConfig("valid"));

		expect(result.exitCode).toBe(0);
		expect(result.issues).toEqual([]);
	});
});
