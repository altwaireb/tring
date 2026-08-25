import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TranslationSortResult } from "@/app";
import { runSortCommand } from "@/cli/commands/sort";
import type { TringConfig } from "@/config";

const mocks = vi.hoisted(() => ({
	sortApplication: vi.fn(),
}));

vi.mock("@/app", () => ({
	sortApplication: mocks.sortApplication,
}));

describe("sort command", () => {
	const config = createConfig();

	beforeEach(() => {
		vi.clearAllMocks();

		mocks.sortApplication.mockResolvedValue({
			results: createResults(),
		});
	});

	it("sorts translation files", async () => {
		const result = await runSortCommand(config);

		expect(mocks.sortApplication).toHaveBeenCalledWith(config, {});

		expect(result).toEqual({
			exitCode: 0,
			results: createResults(),
		});
	});

	it("reports when all translation files are already sorted", async () => {
		const results: TranslationSortResult[] = [
			createSortResult("en-US", "settings.json", false),
			createSortResult("ar-SA", "settings.json", false),
		];

		mocks.sortApplication.mockResolvedValue({
			results,
		});

		const result = await runSortCommand(config);

		expect(result).toEqual({
			exitCode: 0,
			results,
		});
	});

	it("returns modified and unmodified files", async () => {
		const results: TranslationSortResult[] = [
			createSortResult("en-US", "settings.json", false),
			createSortResult("ar-SA", "settings.json", true),
		];

		mocks.sortApplication.mockResolvedValue({
			results,
		});

		const result = await runSortCommand(config);

		expect(result.results).toEqual(results);

		expect(result.results.filter((item) => item.isModified)).toHaveLength(1);
	});

	it("passes the locale option to the application", async () => {
		const result = await runSortCommand(config, {
			locale: "ar-SA",
		});

		expect(mocks.sortApplication).toHaveBeenCalledWith(config, {
			locale: "ar-SA",
		});

		expect(result).toEqual({
			exitCode: 0,
			results: createResults(),
		});
	});

	it("passes the file option to the application", async () => {
		const result = await runSortCommand(config, {
			file: "ar-SA/admin/roles.json",
		});

		expect(mocks.sortApplication).toHaveBeenCalledWith(config, {
			file: "ar-SA/admin/roles.json",
		});

		expect(result).toEqual({
			exitCode: 0,
			results: createResults(),
		});
	});

	it("rejects --file together with --locale", async () => {
		await expect(
			runSortCommand(config, {
				file: "ar-SA/admin/roles.json",
				locale: "ar-SA",
			}),
		).rejects.toThrow(
			'The "--file" option cannot be used together with "--locale".',
		);

		expect(mocks.sortApplication).not.toHaveBeenCalled();
	});
});

function createConfig(overrides: Partial<TringConfig> = {}): TringConfig {
	return {
		source: "en-US",
		locales: ["ar-SA", "fr-FR", "de-DE"],
		layout: "directories",
		path: "tests/app/i18n/nested",
		...overrides,
	} as TringConfig;
}

function createResults(): TranslationSortResult[] {
	return [
		createSortResult("en-US", "admin/users.json", true),
		createSortResult("ar-SA", "settings.json", true),
		createSortResult("ar-SA", "notifications/email.json", true),
	];
}

function createSortResult(
	locale: string,
	key: string,
	isModified: boolean,
): TranslationSortResult {
	return {
		isModified,
		file: {
			locale,
			directory: "",
			name: key.replace(/\.json$/, ""),
			filename: key.split("/").pop() ?? key,
			isLocaleFile: false,
			key,
			path: key,
		},
	};
}
