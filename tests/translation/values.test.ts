import { describe, expect, it } from "vitest";

import {
	getEmptyTranslationKeys,
	getTranslationValue,
} from "@/translation/values";

describe("getTranslationValue", () => {
	it("gets a top-level value", () => {
		const document = {
			title: "Settings",
		};

		expect(getTranslationValue(document, "title")).toBe("Settings");
	});

	it("gets a nested value", () => {
		const document = {
			settings: {
				title: "Settings",
				description: "Manage your settings",
			},
		};

		expect(getTranslationValue(document, "settings.title")).toBe("Settings");
		expect(getTranslationValue(document, "settings.description")).toBe(
			"Manage your settings",
		);
	});

	it("returns undefined for a missing key", () => {
		const document = {
			settings: {
				title: "Settings",
			},
		};

		expect(
			getTranslationValue(document, "settings.description"),
		).toBeUndefined();
	});

	it("preserves an empty translation value", () => {
		const document = {
			settings: {
				title: "",
			},
		};

		expect(getTranslationValue(document, "settings.title")).toBe("");
	});
});

describe("getEmptyTranslationKeys", () => {
	it("finds top-level empty values", () => {
		const document = {
			title: "",
			description: "Manage your settings",
		};

		expect(getEmptyTranslationKeys(document)).toEqual(["title"]);
	});

	it("finds nested empty values", () => {
		const document = {
			settings: {
				title: "",
				description: "Manage your settings",
				security: {
					password: "",
				},
			},
		};

		expect(getEmptyTranslationKeys(document)).toEqual([
			"settings.title",
			"settings.security.password",
		]);
	});

	it("returns an empty array when there are no empty values", () => {
		const document = {
			title: "Settings",
			settings: {
				description: "Manage your settings",
			},
		};

		expect(getEmptyTranslationKeys(document)).toEqual([]);
	});

	it("preserves the document key order", () => {
		const document = {
			z: "",
			a: "",
			settings: {
				y: "",
				b: "",
			},
		};

		expect(getEmptyTranslationKeys(document)).toEqual([
			"z",
			"a",
			"settings.y",
			"settings.b",
		]);
	});
});
