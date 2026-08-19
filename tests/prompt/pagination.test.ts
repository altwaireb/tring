import { describe, expect, it } from "vitest";

import { parsePaginationAction } from "@/prompt/pagination";

describe("parsePaginationAction", () => {
	it("returns continue for an empty input", () => {
		expect(parsePaginationAction("")).toBe("continue");
	});

	it("returns continue for whitespace", () => {
		expect(parsePaginationAction("   ")).toBe("continue");
	});

	it("returns quit for q", () => {
		expect(parsePaginationAction("q")).toBe("quit");
	});

	it("returns quit for uppercase Q", () => {
		expect(parsePaginationAction("Q")).toBe("quit");
	});
});
