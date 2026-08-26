import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SyncApplicationResult } from "@/app";
import { runSyncCommand } from "@/cli/commands/sync";
import type { TringConfig } from "@/config";
import type { TranslationSyncWriteResult } from "@/translation";

const mocks = vi.hoisted(() => ({
	syncApplication: vi.fn(),
	applyTranslationSyncPlan: vi.fn(),
}));

vi.mock("@/app", () => ({
	syncApplication: mocks.syncApplication,
}));

vi.mock("@/translation", async () => {
	const actual =
		await vi.importActual<typeof import("@/translation")>("@/translation");

	return {
		...actual,
		applyTranslationSyncPlan: mocks.applyTranslationSyncPlan,
	};
});

describe("sync command", () => {
	const config = createConfig();

	beforeEach(() => {
		vi.clearAllMocks();

		mocks.syncApplication.mockResolvedValue(createApplicationResult());

		mocks.applyTranslationSyncPlan.mockResolvedValue(createWriteResult());
	});

	it("creates a sync plan without applying changes", async () => {
		const result = await runSyncCommand(config);

		expect(mocks.syncApplication).toHaveBeenCalledWith(config);
		expect(mocks.applyTranslationSyncPlan).not.toHaveBeenCalled();

		expect(result).toEqual({
			exitCode: 0,
			plan: createApplicationResult().plan,
		});
	});

	it("creates a sync plan in dry-run mode without applying changes", async () => {
		const result = await runSyncCommand(config, {
			dryRun: true,
		});

		expect(mocks.syncApplication).toHaveBeenCalledWith(config);
		expect(mocks.applyTranslationSyncPlan).not.toHaveBeenCalled();

		expect(result).toEqual({
			exitCode: 0,
			plan: createApplicationResult().plan,
		});
	});

	it("applies the sync plan", async () => {
		const result = await runSyncCommand(config, {
			apply: true,
		});

		expect(mocks.syncApplication).toHaveBeenCalledWith(config);

		expect(mocks.applyTranslationSyncPlan).toHaveBeenCalledWith(
			config,
			createApplicationResult().plan,
			false,
		);

		expect(result).toEqual({
			exitCode: 0,
			plan: createApplicationResult().plan,
			writeResult: createWriteResult(),
		});
	});

	it("applies the sync plan using empty values for missing translations", async () => {
		const result = await runSyncCommand(config, {
			apply: true,
			empty: true,
		});

		expect(mocks.syncApplication).toHaveBeenCalledWith(config);

		expect(mocks.applyTranslationSyncPlan).toHaveBeenCalledWith(
			config,
			createApplicationResult().plan,
			true,
		);

		expect(result).toEqual({
			exitCode: 0,
			plan: createApplicationResult().plan,
			writeResult: createWriteResult(),
		});
	});

	it('rejects "--dry-run" together with "--apply"', async () => {
		await expect(
			runSyncCommand(config, {
				dryRun: true,
				apply: true,
			}),
		).rejects.toThrow(
			'The "--dry-run" and "--apply" options cannot be used together.',
		);

		expect(mocks.syncApplication).not.toHaveBeenCalled();
		expect(mocks.applyTranslationSyncPlan).not.toHaveBeenCalled();
	});

	it('rejects "--dry-run" together with "--empty"', async () => {
		await expect(
			runSyncCommand(config, {
				dryRun: true,
				empty: true,
			}),
		).rejects.toThrow(
			'The "--dry-run" and "--empty" options cannot be used together.',
		);

		expect(mocks.syncApplication).not.toHaveBeenCalled();
		expect(mocks.applyTranslationSyncPlan).not.toHaveBeenCalled();
	});

	it('rejects "--empty" without "--apply"', async () => {
		await expect(
			runSyncCommand(config, {
				empty: true,
			}),
		).rejects.toThrow('The "--empty" option requires "--apply".');

		expect(mocks.syncApplication).not.toHaveBeenCalled();
		expect(mocks.applyTranslationSyncPlan).not.toHaveBeenCalled();
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

function createApplicationResult(): SyncApplicationResult {
	return {
		plan: {
			files: [
				{
					locale: "ar-SA",
					displayPath: "ar-SA/common.json",
					source: createFile("en-US", "common.json"),
					target: createFile("ar-SA", "common.json"),
					targetPath: "tests/app/i18n/nested/ar-SA/common.json",
					changes: [
						{
							key: "login",
							sourceValue: "Login",
						},
					],
				},
			],
		},
	};
}

function createWriteResult(): TranslationSyncWriteResult {
	return {
		filesCreated: 1,
		filesUpdated: 0,
	};
}

function createFile(locale: string, key: string) {
	return {
		locale,
		directory: "",
		name: key.replace(/\.json$/, ""),
		filename: key,
		isLocaleFile: false,
		key,
		path: `/translations/${locale}/${key}`,
	};
}
