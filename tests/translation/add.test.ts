import { describe, expect, it } from "vitest";

import type { TranslationDocument } from "@/translation";
import { createTranslationAddPlan } from "@/translation";

function createFile(locale: string, key: string, path: string) {
	return {
		locale,
		directory: "",
		name: key.replace(/\.json$/, ""),
		filename: key,
		key,
		isLocaleFile: false,
		path,
	};
}

function createDocument(
	locale: string,
	key: string,
	data: Record<string, unknown>,
): TranslationDocument {
	return {
		file: createFile(locale, key, `/translations/${locale}/${key}`),
		data: data as TranslationDocument["data"],
	};
}

describe("createTranslationAddPlan", () => {
	it("adds keys that do not exist in the target", () => {
		const source = createDocument("en-US", "common.json", {
			common: {
				hello: "Hello",
				bye: "Goodbye",
			},
		});

		const target = createDocument("de-DE", "common.json", {
			common: {
				hello: "Hallo",
			},
		});

		const result = createTranslationAddPlan(source, target, "de-DE");

		expect(result.files).toEqual([
			{
				locale: "de-DE",
				source: source.file,
				target: target.file,
				changes: [
					{
						key: "common.bye",
						sourceValue: "Goodbye",
					},
				],
			},
		]);
	});

	it("does not modify existing keys even when their value is empty", () => {
		const source = createDocument("en-US", "common.json", {
			common: {
				hello: "Hello",
			},
		});

		const target = createDocument("de-DE", "common.json", {
			common: {
				hello: "",
			},
		});

		const result = createTranslationAddPlan(source, target, "de-DE");

		expect(result.files).toEqual([]);
	});

	it("creates a file plan when the target does not exist", () => {
		const source = createDocument("en-US", "common.json", {
			common: {
				hello: "Hello",
			},
		});

		const result = createTranslationAddPlan(source, undefined, "de-DE");

		expect(result.files).toEqual([
			{
				locale: "de-DE",
				source: source.file,
				changes: [
					{
						key: "common.hello",
						sourceValue: "Hello",
					},
				],
			},
		]);
	});
});
