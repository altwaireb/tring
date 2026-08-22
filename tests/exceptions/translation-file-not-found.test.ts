import { describe, expect, it } from "vitest";

import { TranslationFileNotFoundError } from "@/exceptions";

describe("TranslationFileNotFoundError", () => {
	it("creates an error with the expected message", () => {
		const error = new TranslationFileNotFoundError("en-US/admin/missing.json");

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(TranslationFileNotFoundError);
		expect(error.name).toBe("TranslationFileNotFoundError");
		expect(error.message).toBe(
			"Translation file not found: en-US/admin/missing.json",
		);
	});
});
