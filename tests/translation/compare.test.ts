import { describe, expect, it } from "vitest";

import { compareTranslationKeys } from "@/translation";

describe("compareTranslationKeys", () => {
	it("returns no differences when keys are identical", () => {
		const source = ["auth.login.title", "auth.login.button"];

		const target = ["auth.login.title", "auth.login.button"];

		expect(compareTranslationKeys(source, target)).toEqual({
			missing: [],
			extra: [],
		});
	});

	it("finds missing keys", () => {
		const source = ["auth.login.title", "auth.login.button", "profile.name"];

		const target = ["auth.login.title", "profile.name"];

		expect(compareTranslationKeys(source, target)).toEqual({
			missing: ["auth.login.button"],
			extra: [],
		});
	});

	it("finds extra keys", () => {
		const source = ["auth.login.title"];

		const target = ["auth.login.title", "auth.logout.title"];

		expect(compareTranslationKeys(source, target)).toEqual({
			missing: [],
			extra: ["auth.logout.title"],
		});
	});

	it("finds both missing and extra keys", () => {
		const source = ["auth.login.title", "auth.login.button"];

		const target = ["auth.login.title", "auth.logout.title"];

		expect(compareTranslationKeys(source, target)).toEqual({
			missing: ["auth.login.button"],
			extra: ["auth.logout.title"],
		});
	});

	it("preserves source and target key order", () => {
		const source = ["z_key", "a_key", "m_key"];

		const target = ["m_key"];

		expect(compareTranslationKeys(source, target)).toEqual({
			missing: ["z_key", "a_key"],
			extra: [],
		});
	});
});
