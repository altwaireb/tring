import { describe, expect, it } from "vitest";

import { getTranslationValue } from "@/translation/values";

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
