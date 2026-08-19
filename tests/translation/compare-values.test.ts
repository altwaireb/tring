import { describe, expect, it } from "vitest";

import { compareTranslationValues } from "@/translation/compare-values";
import type { TranslationDocument } from "@/translation/document";

function createDocument(
	locale: string,
	data: TranslationDocument["data"],
): TranslationDocument {
	return {
		file: {
			locale,
			directory: "",
			name: "users",
			filename: "users.json",
			key: "users.json",
			isLocaleFile: false,
			path: `/${locale}/users.json`,
		},
		data,
	};
}

describe("compareTranslationValues", () => {
	it("compares translation values across locales", () => {
		const source = createDocument("en-US", {
			title: "Users",
			description: "Manage users",
		});

		const arabic = createDocument("ar-SA", {
			title: "المستخدمون",
			description: "إدارة المستخدمين",
		});

		const french = createDocument("fr-FR", {
			title: "Utilisateurs",
			description: "Gérer les utilisateurs",
		});

		const result = compareTranslationValues(
			source,
			[arabic, french],
			["en-US", "ar-SA", "fr-FR"],
		);

		expect(result).toEqual([
			{
				key: "title",
				values: {
					"en-US": "Users",
					"ar-SA": "المستخدمون",
					"fr-FR": "Utilisateurs",
				},
			},
			{
				key: "description",
				values: {
					"en-US": "Manage users",
					"ar-SA": "إدارة المستخدمين",
					"fr-FR": "Gérer les utilisateurs",
				},
			},
		]);
	});

	it("returns undefined for a missing key", () => {
		const source = createDocument("en-US", {
			title: "Users",
			description: "Manage users",
		});

		const arabic = createDocument("ar-SA", {
			title: "المستخدمون",
		});

		const result = compareTranslationValues(
			source,
			[arabic],
			["en-US", "ar-SA"],
		);

		expect(result).toEqual([
			{
				key: "title",
				values: {
					"en-US": "Users",
					"ar-SA": "المستخدمون",
				},
			},
			{
				key: "description",
				values: {
					"en-US": "Manage users",
					"ar-SA": undefined,
				},
			},
		]);
	});

	it("preserves empty translation values", () => {
		const source = createDocument("en-US", {
			title: "Users",
		});

		const arabic = createDocument("ar-SA", {
			title: "",
		});

		const result = compareTranslationValues(
			source,
			[arabic],
			["en-US", "ar-SA"],
		);

		expect(result).toEqual([
			{
				key: "title",
				values: {
					"en-US": "Users",
					"ar-SA": "",
				},
			},
		]);
	});

	it("compares nested translation keys", () => {
		const source = createDocument("en-US", {
			settings: {
				title: "Settings",
				description: "Manage settings",
			},
		});

		const arabic = createDocument("ar-SA", {
			settings: {
				title: "الإعدادات",
				description: "إدارة الإعدادات",
			},
		});

		const result = compareTranslationValues(
			source,
			[arabic],
			["en-US", "ar-SA"],
		);

		expect(result).toEqual([
			{
				key: "settings.title",
				values: {
					"en-US": "Settings",
					"ar-SA": "الإعدادات",
				},
			},
			{
				key: "settings.description",
				values: {
					"en-US": "Manage settings",
					"ar-SA": "إدارة الإعدادات",
				},
			},
		]);
	});
});
