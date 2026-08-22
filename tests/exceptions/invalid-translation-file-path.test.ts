import { describe, expect, it } from "vitest";

import { InvalidTranslationFilePathError } from "@/exceptions";

describe("InvalidTranslationFilePathError", () => {
	it("creates an error with the expected message", () => {
		const error = new InvalidTranslationFilePathError("admin/roles.json");

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe("InvalidTranslationFilePathError");
		expect(error.message).toBe(
			"Invalid translation file path: admin/roles.json",
		);
	});
});
