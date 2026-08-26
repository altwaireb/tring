import { describe, expect, it } from "vitest";

import type { TranslationDocument } from "@/translation";
import { createTranslationSyncPlan } from "@/translation";

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

describe("createTranslationSyncPlan", () => {
	it("finds missing translation keys", () => {
		const source = createDocument("en-US", "common.json", {
			welcome: "Welcome",
			login: "Login",
		});

		const target = createDocument("ar-SA", "common.json", {
			welcome: "مرحباً",
		});

		const result = createTranslationSyncPlan(source, [target], ["ar-SA"]);

		expect(result.files).toEqual([
			{
				locale: "ar-SA",
				source: source.file,
				target: target.file,
				changes: [
					{
						key: "login",
						sourceValue: "Login",
					},
				],
			},
		]);
	});

	it("finds empty translation values", () => {
		const source = createDocument("en-US", "common.json", {
			welcome: "Welcome",
			login: "Login",
		});

		const target = createDocument("ar-SA", "common.json", {
			welcome: "",
			login: "تسجيل الدخول",
		});

		const result = createTranslationSyncPlan(source, [target], ["ar-SA"]);

		expect(result.files[0]?.changes).toEqual([
			{
				key: "welcome",
				sourceValue: "Welcome",
			},
		]);
	});

	it("ignores existing non-empty translations", () => {
		const source = createDocument("en-US", "common.json", {
			welcome: "Welcome",
			login: "Login",
		});

		const target = createDocument("ar-SA", "common.json", {
			welcome: "مرحباً",
			login: "تسجيل الدخول",
		});

		const result = createTranslationSyncPlan(source, [target], ["ar-SA"]);

		expect(result.files).toEqual([]);
	});

	it("includes all source keys when the target file is missing", () => {
		const source = createDocument("en-US", "common.json", {
			welcome: "Welcome",
			login: "Login",
			profile: {
				title: "Profile",
			},
		});

		const result = createTranslationSyncPlan(source, [], ["ar-SA"]);

		expect(result.files).toEqual([
			{
				locale: "ar-SA",
				source: source.file,
				target: undefined,
				changes: [
					{
						key: "welcome",
						sourceValue: "Welcome",
					},
					{
						key: "login",
						sourceValue: "Login",
					},
					{
						key: "profile.title",
						sourceValue: "Profile",
					},
				],
			},
		]);
	});

	it("creates independent plans for multiple locales", () => {
		const source = createDocument("en-US", "common.json", {
			welcome: "Welcome",
		});

		const ar = createDocument("ar-SA", "common.json", {
			welcome: "",
		});

		const fr = createDocument("fr-FR", "common.json", {});

		const arPlan = createTranslationSyncPlan(source, [ar], ["ar-SA"]);

		const frPlan = createTranslationSyncPlan(source, [fr], ["fr-FR"]);

		const result = {
			files: [...arPlan.files, ...frPlan.files],
		};

		expect(result.files).toHaveLength(2);
		expect(result.files.map((file) => file.locale)).toEqual(["ar-SA", "fr-FR"]);
	});

	it("returns no changes when all translations are complete", () => {
		const source = createDocument("en-US", "common.json", {
			welcome: "Welcome",
		});

		const target = createDocument("ar-SA", "common.json", {
			welcome: "مرحباً",
		});

		const result = createTranslationSyncPlan(source, [target], ["ar-SA"]);

		expect(result.files).toEqual([]);
	});
});
