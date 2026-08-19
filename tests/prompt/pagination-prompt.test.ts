import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	input: vi.fn(),
}));

vi.mock("@inquirer/prompts", () => ({
	input: mocks.input,
}));

import { paginationPrompt } from "@/prompt/pagination";

describe("paginationPrompt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns continue when Enter is pressed", async () => {
		mocks.input.mockResolvedValue("");

		const result = await paginationPrompt();

		expect(result).toBe("continue");

		expect(mocks.input).toHaveBeenCalledWith({
			message: "Press ↵ Enter to continue , q Quit",
			default: "",
			validate: expect.any(Function),
		});
	});

	it("returns quit when q is entered", async () => {
		mocks.input.mockResolvedValue("q");

		const result = await paginationPrompt();

		expect(result).toBe("quit");

		expect(mocks.input).toHaveBeenCalledWith({
			message: "Press ↵ Enter to continue , q Quit",
			default: "",
			validate: expect.any(Function),
		});
	});

	it("passes only Enter and q as valid input", async () => {
		mocks.input.mockResolvedValue("");

		await paginationPrompt();

		const call = mocks.input.mock.calls[0]?.[0];

		expect(call).toBeDefined();

		if (!call) {
			throw new Error("Expected input configuration.");
		}

		expect(call.validate?.("")).toBe(true);
		expect(call.validate?.("q")).toBe(true);
		expect(call.validate?.("Q")).toBe(true);
		expect(call.validate?.("anything")).toBe(
			"Press Enter to continue or q to quit.",
		);
	});
});
