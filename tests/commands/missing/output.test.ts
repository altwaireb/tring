import { afterEach, describe, expect, it, vi } from "vitest";

import {
	printMissingHeader,
	printMissingIssues,
	printMissingPagination,
} from "@/commands/missing/output";
import type { TranslationMissingIssue } from "@/translation/missing";

describe("missing output", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("prints the missing translations header", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printMissingHeader();

		expect(consoleLog.mock.calls).toEqual([["Missing Translations"], []]);
	});

	it("prints missing translation issues", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printMissingIssues([
			createIssue({
				locale: "fr-FR",
				key: "status.inactive",
				isMissing: true,
				isEmpty: false,
			}),
			createIssue({
				locale: "de-DE",
				key: "status.active",
				isMissing: true,
				isEmpty: false,
			}),
		]);

		expect(consoleLog.mock.calls).toEqual([
			["admin/users.json"],
			[],
			["  fr-FR  │  status.inactive | MISSING"],
			["  de-DE  │  status.active | MISSING"],
		]);
	});

	it("prints empty translation issues with warning mark", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printMissingIssues([
			createIssue({
				locale: "fr-FR",
				key: "status.active",
				isMissing: false,
				isEmpty: true,
			}),
		]);

		expect(consoleLog.mock.calls).toEqual([
			["admin/users.json"],
			[],
			["  ⚠ fr-FR  │  status.active | EMPTY"],
		]);
	});

	it("separates different resources", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printMissingIssues([
			createIssue({
				locale: "fr-FR",
				key: "status.active",
				isMissing: true,
				isEmpty: false,
			}),
			createIssue({
				locale: "de-DE",
				key: "settings.title",
				isMissing: true,
				isEmpty: false,
				resource: {
					...createIssue().resource,
					key: "settings.json",
				},
			}),
		]);

		expect(consoleLog.mock.calls).toEqual([
			["admin/users.json"],
			[],
			["  fr-FR  │  status.active | MISSING"],
			[],
			["settings.json"],
			[],
			["  de-DE  │  settings.title | MISSING"],
		]);
	});

	it("prints pagination information", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printMissingPagination(10, 25, "missing translations");

		expect(consoleLog).toHaveBeenCalledWith(
			"Showing 10 of 25 missing translations",
		);
	});

	it("prints empty pagination information", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printMissingPagination(3, 3, "empty");

		expect(consoleLog).toHaveBeenCalledWith("Showing 3 of 3 empty");
	});
});

function createIssue(
	overrides: Partial<TranslationMissingIssue> = {},
): TranslationMissingIssue {
	return {
		key: "status.active",
		locale: "fr-FR",
		resource: {
			locale: "en-US",
			directory: "admin",
			name: "users",
			filename: "users.json",
			key: "admin/users.json",
			isLocaleFile: false,
			path: "tests/app/i18n/nested/en-US/admin/users.json",
		},
		value: undefined,
		isMissing: true,
		isEmpty: false,
		...overrides,
	};
}
