import { describe, expect, it } from "vitest";

import { TranslationKeyRule } from "@/config";
import type { TranslationDocument } from "@/translation";
import {
	findTranslationMissingIssues,
	type TranslationFile,
} from "@/translation";

describe("findTranslationMissingIssues", () => {
	it("finds missing translations", () => {
		const source = createDocument("en-US", {
			title: "Title",
			status: {
				active: "Active",
				inactive: "Inactive",
			},
		});

		const arabic = createDocument("ar-SA", {
			title: "العنوان",
			status: {
				active: "نشط",
			},
		});

		const issues = findTranslationMissingIssues(source, [arabic], ["ar-SA"]);

		expect(issues).toEqual([
			{
				key: "status.inactive",
				locale: "ar-SA",
				resource: source.file,
				value: undefined,
				isMissing: true,
				isEmpty: false,
			},
		]);
	});

	it("validates source keys using the specified rule", () => {
		const source = createDocument("en-US", {
			"2FA": "Two-factor authentication",
		});

		const arabic = createDocument("ar-SA", {});

		const issues = findTranslationMissingIssues(
			source,
			[arabic],
			["ar-SA"],
			TranslationKeyRule.alphaNumeric,
		);

		expect(issues).toEqual([
			{
				key: "2FA",
				locale: "ar-SA",
				resource: source.file,
				value: undefined,
				isMissing: true,
				isEmpty: false,
			},
		]);
	});

	it("finds empty translations", () => {
		const source = createDocument("en-US", {
			status: {
				active: "Active",
			},
		});

		const french = createDocument("fr-FR", {
			status: {
				active: "",
			},
		});

		const issues = findTranslationMissingIssues(source, [french], ["fr-FR"]);

		expect(issues).toEqual([
			{
				key: "status.active",
				locale: "fr-FR",
				resource: source.file,
				value: "",
				isMissing: false,
				isEmpty: true,
			},
		]);
	});

	it("distinguishes missing translations from empty translations", () => {
		const source = createDocument("en-US", {
			active: "Active",
			inactive: "Inactive",
		});

		const arabic = createDocument("ar-SA", {
			active: "",
		});

		const issues = findTranslationMissingIssues(source, [arabic], ["ar-SA"]);

		expect(issues).toEqual([
			{
				key: "active",
				locale: "ar-SA",
				resource: source.file,
				value: "",
				isMissing: false,
				isEmpty: true,
			},
			{
				key: "inactive",
				locale: "ar-SA",
				resource: source.file,
				value: undefined,
				isMissing: true,
				isEmpty: false,
			},
		]);
	});

	it("ignores completed translations", () => {
		const source = createDocument("en-US", {
			title: "Title",
		});

		const french = createDocument("fr-FR", {
			title: "Titre",
		});

		const issues = findTranslationMissingIssues(source, [french], ["fr-FR"]);

		expect(issues).toEqual([]);
	});

	it("treats a missing target document as missing translations", () => {
		const source = createDocument("en-US", {
			title: "Title",
			status: {
				active: "Active",
			},
		});

		const issues = findTranslationMissingIssues(source, [], ["de-DE"]);

		expect(issues).toEqual([
			{
				key: "title",
				locale: "de-DE",
				resource: source.file,
				value: undefined,
				isMissing: true,
				isEmpty: false,
			},
			{
				key: "status.active",
				locale: "de-DE",
				resource: source.file,
				value: undefined,
				isMissing: true,
				isEmpty: false,
			},
		]);
	});
});

function createDocument(
	locale: string,
	data: TranslationDocument["data"],
): TranslationDocument {
	const file: TranslationFile = {
		locale,
		directory: "",
		name: "locale",
		filename: `${locale}.json`,
		key: `${locale}.json`,
		isLocaleFile: true,
		path: `tests/translation/fixtures/${locale}.json`,
	};

	return {
		file,
		data,
	};
}
