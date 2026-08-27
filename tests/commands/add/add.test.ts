import { beforeEach, describe, expect, it, vi } from "vitest";

import { addApplication } from "@/app";
import { runAddCommand } from "@/cli/commands/add";
import { defineConfig, TranslationLayout } from "@/config";
import { applyTranslationAddPlan } from "@/translation";

vi.mock("@/app", () => ({
	addApplication: vi.fn(),
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

	it("rejects an unconfigured locale", async () => {
		await expect(
			runAddCommand(config, {
				locale: "es-ES",
			}),
		).rejects.toThrow('The locale "es-ES" is not configured.');
	});

	it("rejects when neither locale nor file is specified", async () => {
		await expect(runAddCommand(config)).rejects.toThrow(
			'Either "--locale" or "--file" must be specified.',
		);
	});
});
