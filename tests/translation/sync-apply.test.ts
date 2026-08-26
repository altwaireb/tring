import { describe, expect, it } from "vitest";

import type { JsonObject } from "@/json";
import type { TranslationSyncChange } from "@/translation";
import { applyTranslationSyncChanges } from "@/translation";

describe("applyTranslationSyncChanges", () => {
	it("applies source values to missing keys", () => {
		const data: JsonObject = {
			welcome: "مرحباً",
		};

		const changes: TranslationSyncChange[] = [
			{
				key: "description",
				sourceValue: "Description",
			},
		];

		applyTranslationSyncChanges(data, changes, false);

		expect(data).toEqual({
			welcome: "مرحباً",
			description: "Description",
		});
	});

	it("writes empty strings when empty mode is enabled", () => {
		const data: JsonObject = {
			welcome: "مرحباً",
		};

		const changes: TranslationSyncChange[] = [
			{
				key: "description",
				sourceValue: "Description",
			},
		];

		applyTranslationSyncChanges(data, changes, true);

		expect(data).toEqual({
			welcome: "مرحباً",
			description: "",
		});
	});

	it("creates nested objects for missing keys", () => {
		const data: JsonObject = {};

		const changes: TranslationSyncChange[] = [
			{
				key: "profile.description",
				sourceValue: "Description",
			},
		];

		applyTranslationSyncChanges(data, changes, false);

		expect(data).toEqual({
			profile: {
				description: "Description",
			},
		});
	});

	it("preserves existing translations", () => {
		const data: JsonObject = {
			welcome: "مرحباً",
			profile: {
				name: "الاسم",
			},
		};

		const changes: TranslationSyncChange[] = [
			{
				key: "description",
				sourceValue: "Description",
			},
		];

		applyTranslationSyncChanges(data, changes, false);

		expect(data).toEqual({
			welcome: "مرحباً",
			profile: {
				name: "الاسم",
			},
			description: "Description",
		});
	});

	it("replaces an incompatible intermediate value with an object", () => {
		const data: JsonObject = {
			profile: "Profile",
		};

		const changes: TranslationSyncChange[] = [
			{
				key: "profile.description",
				sourceValue: "Description",
			},
		];

		applyTranslationSyncChanges(data, changes, false);

		expect(data).toEqual({
			profile: {
				description: "Description",
			},
		});
	});
});
