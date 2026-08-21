import { describe, expect, it } from "vitest";
import type { TranslationMissingIssue } from "@/translation/missing";
import { formatTranslationMissingIssues } from "@/translation/missing-format";

describe("formatTranslationMissingIssues", () => {
	it("formats missing translations", () => {
		const issues = [
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
		];

		expect(formatTranslationMissingIssues(issues)).toBe(
			[
				"fr-FR │ status.inactive | MISSING",
				"de-DE │ status.active | MISSING",
			].join("\n"),
		);
	});

	it("formats empty translations", () => {
		const issues = [
			createIssue({
				locale: "fr-FR",
				key: "status.active",
				isMissing: false,
				isEmpty: true,
			}),
		];

		expect(formatTranslationMissingIssues(issues)).toBe(
			"fr-FR │ status.active | EMPTY",
		);
	});

	it("formats mixed missing and empty translations", () => {
		const issues = [
			createIssue({
				locale: "fr-FR",
				key: "status.active",
				isMissing: false,
				isEmpty: true,
			}),
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
		];

		expect(formatTranslationMissingIssues(issues)).toBe(
			[
				"fr-FR │ status.active | EMPTY",
				"fr-FR │ status.inactive | MISSING",
				"de-DE │ status.active | MISSING",
			].join("\n"),
		);
	});

	it("returns an empty string when there are no issues", () => {
		expect(formatTranslationMissingIssues([])).toBe("");
	});
});

function createIssue(
	overrides: Pick<
		TranslationMissingIssue,
		"locale" | "key" | "isMissing" | "isEmpty"
	>,
): TranslationMissingIssue {
	return {
		...overrides,
		resource: {
			locale: "en-US",
			directory: "admin",
			name: "users",
			filename: "users.json",
			key: "admin/users.json",
			isLocaleFile: false,
			path: "tests/app/i18n/nested/en-US/admin/users.json",
		},
		value: overrides.isEmpty ? "" : undefined,
	};
}
