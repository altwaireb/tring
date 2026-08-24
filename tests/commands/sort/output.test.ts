import { describe, expect, it, vi } from "vitest";

import type { TranslationSortResult } from "@/app";
import { printSortResults } from "@/commands/sort/output";
import { MESSAGES } from "@/messages";

describe("printSortResults", () => {
	it("prints modified translation files", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const results: TranslationSortResult[] = [
			createSortResult("en-US", "admin/users.json", true),
			createSortResult("ar-SA", "settings.json", true),
			createSortResult("ar-SA", "notifications/email.json", true),
		];

		printSortResults(results);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.sortTitle);
		expect(output).toContain(MESSAGES.sortSorted(3));
		expect(output).toContain(MESSAGES.sortModified);
		expect(output).toContain("en-US");
		expect(output).toContain("admin/users.json");
		expect(output).toContain("ar-SA");
		expect(output).toContain("settings.json");
		expect(output).toContain("notifications/email.json");

		consoleLog.mockRestore();
	});

	it("reports when all translation files are already sorted", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const results: TranslationSortResult[] = [
			createSortResult("en-US", "admin/users.json", false),
			createSortResult("ar-SA", "settings.json", false),
		];

		printSortResults(results);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.sortTitle);
		expect(output).toContain(MESSAGES.sortAllSorted);
		expect(output).not.toContain(MESSAGES.sortModified);

		consoleLog.mockRestore();
	});

	it("uses singular form for one modified translation file", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const results: TranslationSortResult[] = [
			createSortResult("en-US", "settings.json", true),
		];

		printSortResults(results);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.sortTitle);
		expect(output).toContain(MESSAGES.sortSorted(1));
		expect(output).toContain(MESSAGES.sortModified);
		expect(output).toContain("en-US");
		expect(output).toContain("settings.json");

		consoleLog.mockRestore();
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
