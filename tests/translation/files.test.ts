import { describe, expect, it } from "vitest";

import {
	findTranslationFile,
	getTranslationFilesByLocale,
	type TranslationFile,
} from "@/translation";

const files: TranslationFile[] = [
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
		directory: "admin",
		name: "users",
		filename: "users.json",
		key: "admin/users.json",
		isLocaleFile: false,
		path: "/ar-SA/admin/users.json",
	},
];

describe("getTranslationFilesByLocale", () => {
	it("returns only files belonging to the requested locale", () => {
		expect(getTranslationFilesByLocale(files, "ar-SA")).toEqual([
			files[1],
			files[2],
		]);
	});

	it("returns an empty array when the locale has no files", () => {
		expect(getTranslationFilesByLocale(files, "fr-FR")).toEqual([]);
	});
});

describe("findTranslationFile", () => {
	it("finds a file by locale and key", () => {
		expect(findTranslationFile(files, "ar-SA", "admin/users.json")).toBe(
			files[2],
		);
	});

	it("returns undefined when the file does not exist", () => {
		expect(findTranslationFile(files, "fr-FR", "common.json")).toBeUndefined();
	});
});
