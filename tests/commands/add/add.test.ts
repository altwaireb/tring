import { beforeEach, describe, expect, it, vi } from "vitest";
import { addApplication } from "@/app";
import { runAddCommand } from "@/cli/commands/add";
import {
	addLocaleToConfig,
	defineConfig,
	hasLocaleInConfig,
	TranslationLayout,
} from "@/config";
import { applyTranslationAddPlan } from "@/translation";

vi.mock("@/app", () => ({ addApplication: vi.fn() }));
vi.mock("@/config", async () => {
	const actual = await vi.importActual<typeof import("@/config")>("@/config");
	return { ...actual, addLocaleToConfig: vi.fn(), hasLocaleInConfig: vi.fn() };
});
vi.mock("@/translation", async () => {
	const actual =
		await vi.importActual<typeof import("@/translation")>("@/translation");
	return { ...actual, applyTranslationAddPlan: vi.fn() };
});
describe("runAddCommand", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasLocaleInConfig).mockResolvedValue(true);
		vi.mocked(addApplication).mockResolvedValue({
			plan: { files: [] },
			skippedLocales: [],
		});
		vi.mocked(applyTranslationAddPlan).mockResolvedValue({
			filesCreated: 0,
			filesUpdated: 0,
		});
	});
	const config = defineConfig({
		directory: "tests/app/i18n/nested",
		layout: TranslationLayout.directories,
		source: "en-US",
		locales: ["ar-SA", "fr-FR", "de-DE"],
	});
	it("runs add for an existing locale", async () => {
		const result = await runAddCommand(config, { locale: "fr-FR" });
		expect(hasLocaleInConfig).toHaveBeenCalledWith("fr-FR");
		expect(addLocaleToConfig).not.toHaveBeenCalled();
		expect(addApplication).toHaveBeenCalledWith(config, { locale: "fr-FR" });
		expect(applyTranslationAddPlan).toHaveBeenCalledWith(
			config,
			result.plan,
			false,
		);
		expect(result.exitCode).toBe(0);
	});
	it("adds a new locale to the config before running add", async () => {
		vi.mocked(hasLocaleInConfig).mockResolvedValue(false);
		const result = await runAddCommand(config, { locale: "zh-CN" });
		const expectedConfig = { ...config, locales: [...config.locales, "zh-CN"] };
		expect(hasLocaleInConfig).toHaveBeenCalledWith("zh-CN");
		expect(addLocaleToConfig).toHaveBeenCalledWith("zh-CN");
		expect(addApplication).toHaveBeenCalledWith(expectedConfig, {
			locale: "zh-CN",
		});
		expect(applyTranslationAddPlan).toHaveBeenCalledWith(
			expectedConfig,
			result.plan,
			false,
		);
	});
	it("does not add an existing locale to the config again", async () => {
		vi.mocked(hasLocaleInConfig).mockResolvedValue(true);
		await runAddCommand(config, { locale: "de-DE" });
		expect(addLocaleToConfig).not.toHaveBeenCalled();
		expect(addApplication).toHaveBeenCalledWith(config, { locale: "de-DE" });
	});
	it("passes empty mode to the add writer for a locale", async () => {
		await runAddCommand(config, { locale: "de-DE", empty: true });
		expect(applyTranslationAddPlan).toHaveBeenCalledWith(
			config,
			expect.anything(),
			true,
		);
	});
	it("adds a new locale and passes empty mode to the add writer", async () => {
		vi.mocked(hasLocaleInConfig).mockResolvedValue(false);
		await runAddCommand(config, { locale: "zh-CN", empty: true });
		const expectedConfig = { ...config, locales: [...config.locales, "zh-CN"] };
		expect(addLocaleToConfig).toHaveBeenCalledWith("zh-CN");
		expect(addApplication).toHaveBeenCalledWith(expectedConfig, {
			locale: "zh-CN",
		});
		expect(applyTranslationAddPlan).toHaveBeenCalledWith(
			expectedConfig,
			expect.anything(),
			true,
		);
	});
	it("passes empty mode to the add writer for a file", async () => {
		await runAddCommand(config, { file: "admin/users.json", empty: true });
		expect(addApplication).toHaveBeenCalledWith(config, {
			file: "admin/users.json",
		});
		expect(applyTranslationAddPlan).toHaveBeenCalledWith(
			config,
			expect.anything(),
			true,
		);
	});
	it("rejects when neither locale nor file is specified", async () => {
		await expect(runAddCommand(config)).rejects.toThrow(
			'Either "--locale" or "--file" must be specified.',
		);
		expect(addApplication).not.toHaveBeenCalled();
		expect(applyTranslationAddPlan).not.toHaveBeenCalled();
	});
	it("rejects when locale and file are used together", async () => {
		await expect(
			runAddCommand(config, { locale: "de-DE", file: "admin/users.json" }),
		).rejects.toThrow(
			'The "--locale" and "--file" options cannot be used together.',
		);
		expect(addApplication).not.toHaveBeenCalled();
		expect(applyTranslationAddPlan).not.toHaveBeenCalled();
	});
	it("rejects file mode for the files layout", async () => {
		const filesConfig = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["de-DE"],
		});
		await expect(
			runAddCommand(filesConfig, { file: "admin/users.json", empty: true }),
		).rejects.toThrow(
			'The "--file" option cannot be used with the "files" translation layout.',
		);
		expect(addApplication).not.toHaveBeenCalled();
		expect(applyTranslationAddPlan).not.toHaveBeenCalled();
	});
});
