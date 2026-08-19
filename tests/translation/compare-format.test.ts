import { describe, expect, it } from "vitest";

import {
	formatTranslationComparison,
	formatTranslationComparisonHeader,
} from "@/translation/compare-format";

describe("formatTranslationComparison", () => {
	it("formats translation values across locales", () => {
		const result = formatTranslationComparison(
			[
				{
					key: "title",
					values: {
						"en-US": "Users",
						"ar-SA": "المستخدمون",
						"fr-FR": "Utilisateurs",
						"de-DE": "Benutzer",
					},
				},
			],
			["en-US", "ar-SA", "fr-FR", "de-DE"],
		);

		expect(result).toBe(`key: title

en-US │ Users
ar-SA │ المستخدمون
fr-FR │ Utilisateurs
de-DE │ Benutzer`);
	});

	it("formats undefined values as missing", () => {
		const result = formatTranslationComparison(
			[
				{
					key: "settings.title",
					values: {
						"en-US": "Settings",
						"ar-SA": "الإعدادات",
						"fr-FR": "Paramètres",
						"de-DE": undefined,
					},
				},
			],
			["en-US", "ar-SA", "fr-FR", "de-DE"],
		);

		expect(result).toBe(`key: settings.title

en-US │ Settings
ar-SA │ الإعدادات
fr-FR │ Paramètres
de-DE │ (⚠ MISSING)`);
	});

	it("preserves empty translation values", () => {
		const result = formatTranslationComparison(
			[
				{
					key: "title",
					values: {
						"en-US": "",
						"ar-SA": undefined,
					},
				},
			],
			["en-US", "ar-SA"],
		);

		expect(result).toBe(`key: title

en-US │
ar-SA │ (⚠ MISSING)`);
	});

	it("formats multiple translation keys", () => {
		const result = formatTranslationComparison(
			[
				{
					key: "title",
					values: {
						"en-US": "Settings",
						"ar-SA": "الإعدادات",
					},
				},
				{
					key: "description",
					values: {
						"en-US": "Manage settings",
						"ar-SA": "إدارة الإعدادات",
					},
				},
			],
			["en-US", "ar-SA"],
		);

		expect(result).toBe(`key: title

en-US │ Settings
ar-SA │ الإعدادات

key: description

en-US │ Manage settings
ar-SA │ إدارة الإعدادات`);
	});

	it("formats the comparison header", () => {
		expect(formatTranslationComparisonHeader("admin/users.json")).toBe(
			`Translation Comparison

admin/users.json`,
		);
	});
});
