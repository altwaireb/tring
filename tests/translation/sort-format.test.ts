import { describe, expect, it } from "vitest";

import type { TranslationSortResult } from "@/app";
import { SYMBOLS } from "@/constants";
import { formatTranslationSort } from "@/translation";

describe("formatTranslationSort", () => {
	it("formats modified translation files", () => {
		const results: TranslationSortResult[] = [
			createSortResult("en-US", "admin/users.json", true),
			createSortResult("ar-SA", "settings.json", true),
			createSortResult("ar-SA", "notifications/email.json", true),
		];

		expect(formatTranslationSort(results)).toBe(
			[
				"Translation Sort",
				"",
				`${SYMBOLS.success} Sorted 3 translation files.`,
				"",
				"Modified:",
				"",
				"en-US │ admin/users.json",
				"ar-SA │ settings.json",
				"ar-SA │ notifications/email.json",
			].join("\n"),
		);
	});

	it("reports when all translation files are already sorted", () => {
		const results: TranslationSortResult[] = [
			createSortResult("en-US", "admin/users.json", false),
			createSortResult("ar-SA", "settings.json", false),
		];

		expect(formatTranslationSort(results)).toBe(
			[
				"Translation Sort",
				"",
				`${SYMBOLS.success} All translation files are already sorted.`,
			].join("\n"),
		);
	});

	it("uses singular form for one modified translation file", () => {
		const results: TranslationSortResult[] = [
			createSortResult("en-US", "settings.json", true),
		];

		expect(formatTranslationSort(results)).toBe(
			[
				"Translation Sort",
				"",
				`${SYMBOLS.success} Sorted 1 translation file.`,
				"",
				"Modified:",
				"",
				"en-US │ settings.json",
			].join("\n"),
		);
	});
});

function createSortResult(
	locale: string,
	key: string,
	isModified: boolean,
): TranslationSortResult {
	return {
		isModified,
		file: {
			locale,
			directory: "",
			name: key.replace(/\.json$/, ""),
			filename: key.split("/").pop() ?? key,
			isLocaleFile: false,
			key,
			path: key,
		},
	};
}
