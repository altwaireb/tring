import { describe, expect, it } from "vitest";

import { findTranslationKeyResources } from "@/app";
import { defineConfig, TranslationLayout } from "@/config";

describe("findTranslationKeyResources", () => {
	const config = defineConfig({
		directory: "tests/app/i18n/nested",
		layout: TranslationLayout.directories,
		source: "en-US",
		locales: ["ar-SA", "fr-FR", "de-DE"],
	});

	it("finds a translation key in a source resource", async () => {
		const resources = await findTranslationKeyResources(
			config,
			"status.active",
		);

		expect(resources.map((resource) => resource.key)).toEqual([
			"admin/users.json",
			"settings.json",
		]);
	});

	it("returns multiple resources when a key exists in multiple source files", async () => {
		const resources = await findTranslationKeyResources(
			config,
			"status.active",
		);

		expect(resources).toHaveLength(2);

		expect(resources.map((resource) => resource.key)).toEqual([
			"admin/users.json",
			"settings.json",
		]);
	});

	it("returns an empty array when the key does not exist", async () => {
		const resources = await findTranslationKeyResources(
			config,
			"does.not.exist",
		);

		expect(resources).toEqual([]);
	});
});
