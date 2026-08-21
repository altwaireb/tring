import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runMissingCommand } from "@/cli/commands/missing";
import type { TringConfig } from "@/config";
import { TranslationLayout } from "@/config/types";
import { paginationPrompt } from "@/prompt";
import type { TranslationMissingIssue } from "@/translation";

const mocks = vi.hoisted(() => ({
	missingApplication: vi.fn(),
}));

vi.mock("@/app", () => ({
	missingApplication: mocks.missingApplication,
}));

vi.mock("@/prompt", async () => {
	const actual = await vi.importActual<typeof import("@/prompt")>("@/prompt");

	return {
		...actual,
		paginationPrompt: vi.fn(),
	};
});

describe("missing command", () => {
	const config = createConfig();

	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});

		vi.clearAllMocks();
		mocks.missingApplication.mockResolvedValue({
			issues: createIssues(),
		});
		vi.mocked(paginationPrompt).mockResolvedValue("quit");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("shows missing translations by default", async () => {
		const result = await runMissingCommand(config);

		expect(result.issues).toEqual([
			expect.objectContaining({
				key: "status.inactive",
				locale: "fr-FR",
				isMissing: true,
				isEmpty: false,
			}),
			expect.objectContaining({
				key: "status.active",
				locale: "de-DE",
				isMissing: true,
				isEmpty: false,
			}),
			expect.objectContaining({
				key: "status.inactive",
				locale: "de-DE",
				isMissing: true,
				isEmpty: false,
			}),
		]);
	});

	it("includes empty translations when --empty is enabled", async () => {
		const result = await runMissingCommand(config, {
			empty: true,
		});

		expect(result.issues).toEqual([
			expect.objectContaining({
				key: "status.active",
				locale: "fr-FR",
				isMissing: false,
				isEmpty: true,
			}),
			expect.objectContaining({
				key: "status.inactive",
				locale: "fr-FR",
				isMissing: true,
				isEmpty: false,
			}),
			expect.objectContaining({
				key: "status.active",
				locale: "de-DE",
				isMissing: true,
				isEmpty: false,
			}),
			expect.objectContaining({
				key: "status.inactive",
				locale: "de-DE",
				isMissing: true,
				isEmpty: false,
			}),
		]);
	});

	it("shows only empty translations when --only-empty is enabled", async () => {
		const result = await runMissingCommand(config, {
			onlyEmpty: true,
		});

		expect(result.issues).toEqual([
			expect.objectContaining({
				key: "status.active",
				locale: "fr-FR",
				isMissing: false,
				isEmpty: true,
			}),
		]);
	});

	it("rejects --only-empty together with --empty", async () => {
		await expect(
			runMissingCommand(config, {
				empty: true,
				onlyEmpty: true,
			}),
		).rejects.toThrow(
			'The "--only-empty" option cannot be used together with "--empty".',
		);

		expect(mocks.missingApplication).not.toHaveBeenCalled();
	});

	it("does not report completed translations", async () => {
		const result = await runMissingCommand(config);

		expect(result.issues).not.toContainEqual(
			expect.objectContaining({
				key: "status.inactive",
				locale: "ar-SA",
			}),
		);
	});

	it("shows the correct pagination prompt when there are more results", async () => {
		mocks.missingApplication.mockResolvedValue({
			issues: Array.from({ length: 10 }, (_, index) =>
				createIssue({
					key: `missing.${index}`,
					locale: "fr-FR",
					isMissing: true,
					isEmpty: false,
				}),
			),
		});

		await runMissingCommand(config);

		expect(paginationPrompt).toHaveBeenCalled();
	});

	it("supports files layout", async () => {
		const filesConfig = createConfig({
			layout: TranslationLayout.files,
		});

		const filesIssues = [
			createIssue({
				key: "status.active",
				locale: "fr-FR",
				isMissing: true,
				isEmpty: false,
				resource: createResource({
					isLocaleFile: true,
					key: "fr-FR.json",
					filename: "fr-FR.json",
					name: "locale",
					directory: "",
				}),
			}),
		];

		mocks.missingApplication.mockResolvedValue({
			issues: filesIssues,
		});

		const result = await runMissingCommand(filesConfig);

		expect(mocks.missingApplication).toHaveBeenCalledWith(filesConfig);

		expect(result.issues).toEqual([
			expect.objectContaining({
				key: "status.active",
				locale: "fr-FR",
				isMissing: true,
				isEmpty: false,
				resource: expect.objectContaining({
					isLocaleFile: true,
					key: "fr-FR.json",
				}),
			}),
		]);
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

function createIssues(): TranslationMissingIssue[] {
	return [
		createIssue({
			key: "status.active",
			locale: "fr-FR",
			isMissing: false,
			isEmpty: true,
		}),
		createIssue({
			key: "status.inactive",
			locale: "fr-FR",
			isMissing: true,
			isEmpty: false,
		}),
		createIssue({
			key: "status.active",
			locale: "de-DE",
			isMissing: true,
			isEmpty: false,
		}),
		createIssue({
			key: "status.inactive",
			locale: "de-DE",
			isMissing: true,
			isEmpty: false,
		}),
		createIssue({
			key: "status.inactive",
			locale: "ar-SA",
			isMissing: false,
			isEmpty: false,
			value: "غير نشط",
		}),
	];
}

function createIssue(
	overrides: Partial<TranslationMissingIssue> = {},
): TranslationMissingIssue {
	return {
		key: "status.active",
		locale: "fr-FR",
		resource: createResource(),
		value: undefined,
		isMissing: true,
		isEmpty: false,
		...overrides,
	};
}

function createResource(
	overrides: Partial<TranslationMissingIssue["resource"]> = {},
): TranslationMissingIssue["resource"] {
	return {
		locale: "en-US",
		directory: "admin",
		name: "users",
		filename: "users.json",
		key: "admin/users.json",
		isLocaleFile: false,
		path: "tests/app/i18n/nested/en-US/admin/users.json",
		...overrides,
	};
}
