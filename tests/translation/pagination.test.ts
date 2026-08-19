import { describe, expect, it } from "vitest";

import { getTranslationPage } from "@/translation/pagination";

describe("getTranslationPage", () => {
	it("returns the first page", () => {
		const items = Array.from({ length: 18 }, (_, index) => index + 1);

		expect(getTranslationPage(items, 0, 8)).toEqual({
			items: [1, 2, 3, 4, 5, 6, 7, 8],
			shown: 8,
			total: 18,
			hasNext: true,
		});
	});

	it("returns the second page", () => {
		const items = Array.from({ length: 18 }, (_, index) => index + 1);

		expect(getTranslationPage(items, 1, 8)).toEqual({
			items: [9, 10, 11, 12, 13, 14, 15, 16],
			shown: 16,
			total: 18,
			hasNext: true,
		});
	});

	it("returns the final partial page", () => {
		const items = Array.from({ length: 18 }, (_, index) => index + 1);

		expect(getTranslationPage(items, 2, 8)).toEqual({
			items: [17, 18],
			shown: 18,
			total: 18,
			hasNext: false,
		});
	});

	it("handles fewer items than the page size", () => {
		const items = [1, 2, 3];

		expect(getTranslationPage(items, 0, 8)).toEqual({
			items: [1, 2, 3],
			shown: 3,
			total: 3,
			hasNext: false,
		});
	});

	it("returns an empty page when the page is beyond the end", () => {
		const items = [1, 2, 3];

		expect(getTranslationPage(items, 1, 8)).toEqual({
			items: [],
			shown: 3,
			total: 3,
			hasNext: false,
		});
	});
});
