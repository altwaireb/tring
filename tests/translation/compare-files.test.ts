import { describe, expect, it } from "vitest";

import { compareTranslationFiles, type TranslationFile } from "@/translation";

describe("compareTranslationFiles", () => {
	it("matches translation files by logical identity", () => {
		const source: TranslationFile[] = [
			{
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/en-US/common.json",
			},
			{
				locale: "en-US",
				directory: "",
				name: "auth",
				filename: "auth.json",
				key: "auth.json",
				isLocaleFile: false,
				path: "/en-US/auth.json",
			},
		];

		const target: TranslationFile[] = [
			{
				locale: "ar-SA",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/ar-SA/common.json",
			},
			{
				locale: "ar-SA",
				directory: "",
				name: "auth",
				filename: "auth.json",
				key: "auth.json",
				isLocaleFile: false,
				path: "/ar-SA/auth.json",
			},
		];

		expect(compareTranslationFiles(source, target)).toEqual({
			missing: [],
			extra: [],
			matched: [
				{
					source: source[0],
					target: target[0],
				},
				{
					source: source[1],
					target: target[1],
				},
			],
		});
	});

	it("finds missing translation files by logical identity", () => {
		const source: TranslationFile[] = [
			{
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/en-US/common.json",
			},
			{
				locale: "en-US",
				directory: "",
				name: "profile",
				filename: "profile.json",
				key: "profile.json",
				isLocaleFile: false,
				path: "/en-US/profile.json",
			},
		];

		const target: TranslationFile[] = [
			{
				locale: "ar-SA",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/ar-SA/common.json",
			},
		];

		expect(compareTranslationFiles(source, target)).toEqual({
			missing: [source[1]],
			extra: [],
			matched: [
				{
					source: source[0],
					target: target[0],
				},
			],
		});
	});

	it("finds extra translation files by logical identity", () => {
		const source: TranslationFile[] = [
			{
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/en-US/common.json",
			},
		];

		const target: TranslationFile[] = [
			{
				locale: "ar-SA",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/ar-SA/common.json",
			},
			{
				locale: "ar-SA",
				directory: "",
				name: "legacy",
				filename: "legacy.json",
				key: "legacy.json",
				isLocaleFile: false,
				path: "/ar-SA/legacy.json",
			},
		];

		expect(compareTranslationFiles(source, target)).toEqual({
			missing: [],
			extra: [target[1]],
			matched: [
				{
					source: source[0],
					target: target[0],
				},
			],
		});
	});

	it("finds missing and extra files by logical identity", () => {
		const source: TranslationFile[] = [
			{
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/en-US/common.json",
			},
			{
				locale: "en-US",
				directory: "",
				name: "profile",
				filename: "profile.json",
				key: "profile.json",
				isLocaleFile: false,
				path: "/en-US/profile.json",
			},
		];

		const target: TranslationFile[] = [
			{
				locale: "ar-SA",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/ar-SA/common.json",
			},
			{
				locale: "ar-SA",
				directory: "",
				name: "legacy",
				filename: "legacy.json",
				key: "legacy.json",
				isLocaleFile: false,
				path: "/ar-SA/legacy.json",
			},
		];

		expect(compareTranslationFiles(source, target)).toEqual({
			missing: [source[1]],
			extra: [target[1]],
			matched: [
				{
					source: source[0],
					target: target[0],
				},
			],
		});
	});

	it("preserves the source file order", () => {
		const source: TranslationFile[] = [
			{
				locale: "en-US",
				directory: "",
				name: "profile",
				filename: "profile.json",
				key: "profile.json",
				isLocaleFile: false,
				path: "/en-US/profile.json",
			},
			{
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/en-US/common.json",
			},
		];

		const target: TranslationFile[] = [
			{
				locale: "ar-SA",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/ar-SA/common.json",
			},
			{
				locale: "ar-SA",
				directory: "",
				name: "profile",
				filename: "profile.json",
				key: "profile.json",
				isLocaleFile: false,
				path: "/ar-SA/profile.json",
			},
		];

		const result = compareTranslationFiles(source, target);

		expect(result.matched).toEqual([
			{
				source: source[0],
				target: target[1],
			},
			{
				source: source[1],
				target: target[0],
			},
		]);
	});

	it("matches the same logical file across different locale paths", () => {
		const source: TranslationFile[] = [
			{
				locale: "en-US",
				directory: "admin",
				name: "common",
				filename: "common.json",
				key: "admin/common.json",
				isLocaleFile: false,
				path: "/en-US/admin/common.json",
			},
		];

		const target: TranslationFile[] = [
			{
				locale: "ar-SA",
				directory: "admin",
				name: "common",
				filename: "common.json",
				key: "admin/common.json",
				isLocaleFile: false,
				path: "/ar-SA/admin/common.json",
			},
		];

		expect(compareTranslationFiles(source, target)).toEqual({
			missing: [],
			extra: [],
			matched: [
				{
					source: source[0],
					target: target[0],
				},
			],
		});
	});

	it("distinguishes files with the same name in different directories", () => {
		const source: TranslationFile[] = [
			{
				locale: "en-US",
				directory: "admin",
				name: "common",
				filename: "common.json",
				key: "admin/common.json",
				isLocaleFile: false,
				path: "/en-US/admin/common.json",
			},
			{
				locale: "en-US",
				directory: "user",
				name: "common",
				filename: "common.json",
				key: "user/common.json",
				isLocaleFile: false,
				path: "/en-US/user/common.json",
			},
		];

		const target: TranslationFile[] = [
			{
				locale: "ar-SA",
				directory: "admin",
				name: "common",
				filename: "common.json",
				key: "admin/common.json",
				isLocaleFile: false,
				path: "/ar-SA/admin/common.json",
			},
		];

		expect(compareTranslationFiles(source, target)).toEqual({
			missing: [source[1]],
			extra: [],
			matched: [
				{
					source: source[0],
					target: target[0],
				},
			],
		});
	});

	it("matches locale files across different locale filenames", () => {
		const source: TranslationFile[] = [
			{
				locale: "en-US",
				directory: "",
				name: "locale",
				filename: "en-US.json",
				key: "en-US.json",
				isLocaleFile: true,
				path: "/en-US.json",
			},
		];

		const target: TranslationFile[] = [
			{
				locale: "ar-SA",
				directory: "",
				name: "locale",
				filename: "ar-SA.json",
				key: "ar-SA.json",
				isLocaleFile: true,
				path: "/ar-SA.json",
			},
		];

		expect(compareTranslationFiles(source, target)).toEqual({
			missing: [],
			extra: [],
			matched: [
				{
					source: source[0],
					target: target[0],
				},
			],
		});
	});
});
