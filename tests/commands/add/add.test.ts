import { beforeEach, describe, expect, it, vi } from "vitest";

import { addApplication } from "@/app";
import { runAddCommand } from "@/cli/commands/add";
import { defineConfig, TranslationLayout } from "@/config";
import { applyTranslationAddPlan } from "@/translation";

const hasLocaleInConfig = vi.hoisted(() => vi.fn());
const addLocaleToConfig = vi.hoisted(() => vi.fn());

vi.mock("@/app", () => ({
	addApplication: vi.fn(),
}));

vi.mock("@/config/locales", () => ({
	hasLocaleInConfig,
	addLocaleToConfig,
}));

vi.mock("@/translation", async () => {
	const actual =
		await vi.importActual<typeof import("@/translation")>("@/translation");

	return {
		...actual,
		applyTranslationAddPlan: vi.fn(),
	};
});

describe("runAddCommand", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		hasLocaleInConfig.mockResolvedValue(true);
		addLocaleToConfig.mockResolvedValue(undefined);
	});

	const config = defineConfig({
		directory: "tests/app/i18n/nested",
		layout: TranslationLayout.directories,
		source: "en-US",
		locales: ["ar-SA", "fr-FR", "de-DE"],
	});

	it("runs add independently from sync", async () => {
		const plan = {
			files: [],
		};

		vi.mocked(addApplication).mockResolvedValue({
			plan,
			skippedLocales: [],
		});

		vi.mocked(applyTranslationAddPlan).mockResolvedValue({
			filesCreated: 0,
			filesUpdated: 0,
		});

		const result = await runAddCommand(config, {
			locale: "fr-FR",
		});

		expect(addApplication).toHaveBeenCalledWith(config, {
			locale: "fr-FR",
		});

		expect(applyTranslationAddPlan).toHaveBeenCalledWith(config, plan, false);

		expect(result.plan).toBe(plan);
	});

	it("passes the file option without requiring sync", async () => {
		const plan = {
			files: [],
			skippedLocales: ["fr-FR"],
		};

		vi.mocked(addApplication).mockResolvedValue({
			plan,
			skippedLocales: ["fr-FR"],
		});

		vi.mocked(applyTranslationAddPlan).mockResolvedValue({
			filesCreated: 2,
			filesUpdated: 0,
		});

		const result = await runAddCommand(config, {
			file: "admin/users.json",
		});

		expect(addApplication).toHaveBeenCalledWith(config, {
			file: "admin/users.json",
		});

		expect(applyTranslationAddPlan).toHaveBeenCalledWith(config, plan, false);

		expect(result.writeResult.filesCreated).toBe(2);
	});

	it("passes empty mode to the add writer", async () => {
		const plan = {
			files: [],
		};

		vi.mocked(addApplication).mockResolvedValue({
			plan,
			skippedLocales: [],
		});

		vi.mocked(applyTranslationAddPlan).mockResolvedValue({
			filesCreated: 1,
			filesUpdated: 0,
		});

		await runAddCommand(config, {
			locale: "de-DE",
			empty: true,
		});

		expect(applyTranslationAddPlan).toHaveBeenCalledWith(config, plan, true);
	});

	it("adds a new locale to the config", async () => {
		const plan = {
			files: [],
		};

		hasLocaleInConfig.mockResolvedValue(false);

		vi.mocked(addApplication).mockResolvedValue({
			plan,
			skippedLocales: [],
		});

		vi.mocked(applyTranslationAddPlan).mockResolvedValue({
			filesCreated: 1,
			filesUpdated: 0,
		});

		await runAddCommand(config, {
			locale: "es-ES",
		});

		expect(hasLocaleInConfig).toHaveBeenCalledWith("es-ES");
		expect(addLocaleToConfig).toHaveBeenCalledWith("es-ES");

		const updatedConfig = {
			...config,
			locales: ["ar-SA", "fr-FR", "de-DE", "es-ES"],
		};

		expect(addApplication).toHaveBeenCalledWith(updatedConfig, {
			locale: "es-ES",
		});

		expect(applyTranslationAddPlan).toHaveBeenCalledWith(
			updatedConfig,
			plan,
			false,
		);
	});

	it("does not modify the config for an existing locale", async () => {
		const plan = {
			files: [],
		};

		hasLocaleInConfig.mockResolvedValue(true);

		vi.mocked(addApplication).mockResolvedValue({
			plan,
			skippedLocales: [],
		});

		vi.mocked(applyTranslationAddPlan).mockResolvedValue({
			filesCreated: 0,
			filesUpdated: 0,
		});

		await runAddCommand(config, {
			locale: "de-DE",
		});

		expect(hasLocaleInConfig).toHaveBeenCalledWith("de-DE");
		expect(addLocaleToConfig).not.toHaveBeenCalled();

		expect(addApplication).toHaveBeenCalledWith(config, {
			locale: "de-DE",
		});
	});

	it("rejects when neither locale nor file is specified", async () => {
		await expect(runAddCommand(config)).rejects.toThrow(
			'Either "--locale" or "--file" must be specified.',
		);
	});
});
