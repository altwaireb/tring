import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	input: vi.fn(),
	search: vi.fn(),
	select: vi.fn(),
}));

vi.mock("@inquirer/prompts", () => ({
	input: mocks.input,
	search: mocks.search,
	select: mocks.select,
}));

import { input, search, select } from "@/prompt";

describe("prompt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("input", () => {
		it("delegates to inquirer input", async () => {
			mocks.input.mockResolvedValue("ar-SA");

			const result = await input({
				message: "Enter locale:",
				default: "en-US",
				required: true,
			});

			expect(result).toBe("ar-SA");
			expect(mocks.input).toHaveBeenCalledWith({
				message: "Enter locale:",
				default: "en-US",
				required: true,
			});
		});
	});

	describe("select", () => {
		it("delegates to inquirer select", async () => {
			const value = {
				key: "admin/users.json",
				path: "app/i18n/admin/users.json",
			};

			mocks.select.mockResolvedValue(value);

			const result = await select({
				message: "Select a resource:",
				pageSize: 8,
				choices: [
					{
						name: "admin/users.json",
						value,
					},
				],
			});

			expect(result).toEqual(value);
			expect(mocks.select).toHaveBeenCalledWith({
				message: "Select a resource:",
				pageSize: 8,
				choices: [
					{
						name: "admin/users.json",
						value,
					},
				],
			});
		});
	});

	describe("search", () => {
		it("delegates to inquirer search", async () => {
			const value = {
				key: "admin/users.json",
				path: "app/i18n/admin/users.json",
			};

			const source = vi.fn();

			mocks.search.mockResolvedValue(value);

			const result = await search({
				message: "Select a resource:",
				pageSize: 8,
				source,
			});

			expect(result).toEqual(value);
			expect(mocks.search).toHaveBeenCalledWith({
				message: "Select a resource:",
				pageSize: 8,
				source,
			});
		});
	});
});
