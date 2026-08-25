import { afterEach, describe, expect, it, vi } from "vitest";

import { runDoctor } from "@/cli/commands/doctor";

const loadTringConfig = vi.hoisted(() => vi.fn());
const checkConfiguration = vi.hoisted(() => vi.fn());
const checkTranslationDirectory = vi.hoisted(() => vi.fn());
const checkTranslationLayout = vi.hoisted(() => vi.fn());
const checkLocales = vi.hoisted(() => vi.fn());

vi.mock("@/config", () => ({
	loadTringConfig,
}));

vi.mock("@/commands/doctor/checks/configuration", () => ({
	checkConfiguration,
}));

vi.mock("@/commands/doctor/checks/translation-directory", () => ({
	checkTranslationDirectory,
}));

vi.mock("@/commands/doctor/checks/translation-layout", () => ({
	checkTranslationLayout,
}));

vi.mock("@/commands/doctor/checks/locales", () => ({
	checkLocales,
}));

describe("doctor command", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns an error when the configuration is not found", async () => {
		loadTringConfig.mockResolvedValue({
			configFile: undefined,
			config: undefined,
		});

		const result = await runDoctor();

		expect(result).toEqual({
			checks: [],
			success: false,
			error: "Tring configuration file was not found. Run `tring init`.",
		});

		expect(checkConfiguration).not.toHaveBeenCalled();
	});

	it("runs all checks when the project is valid", async () => {
		const config = {
			directory: "i18n",
			layout: "files",
			source: "en-US",
			locales: ["ar-SA", "fr-FR"],
		};

		loadTringConfig.mockResolvedValue({
			configFile: "tring.config.ts",
			config,
		});

		checkConfiguration.mockReturnValue({
			success: true,
			message: "Configuration loaded from tring.config.ts.",
		});

		checkTranslationDirectory.mockResolvedValue({
			success: true,
			message: "Translation directory found: i18n.",
		});

		checkTranslationLayout.mockResolvedValue({
			success: true,
			message: "Translation layout: files (en-US.json).",
		});

		checkLocales.mockResolvedValue({
			success: true,
			message: "Locales found: ar-SA, fr-FR.",
		});

		const result = await runDoctor();

		expect(result).toEqual({
			checks: [
				{
					success: true,
					message: "Configuration loaded from tring.config.ts.",
				},
				{
					success: true,
					message: "Translation directory found: i18n.",
				},
				{
					success: true,
					message: "Translation layout: files (en-US.json).",
				},
				{
					success: true,
					message: "Locales found: ar-SA, fr-FR.",
				},
			],
			success: true,
		});

		expect(checkConfiguration).toHaveBeenCalledWith("tring.config.ts");
		expect(checkTranslationDirectory).toHaveBeenCalledWith(config);
		expect(checkTranslationLayout).toHaveBeenCalledWith(config);
		expect(checkLocales).toHaveBeenCalledWith(config);
	});

	it("stops when the translation directory check fails", async () => {
		const config = {
			directory: "i18n",
			layout: "files",
			source: "en-US",
			locales: ["ar-SA"],
		};

		loadTringConfig.mockResolvedValue({
			configFile: "tring.config.ts",
			config,
		});

		checkConfiguration.mockReturnValue({
			success: true,
			message: "Configuration loaded from tring.config.ts.",
		});

		checkTranslationDirectory.mockResolvedValue({
			success: false,
			message: "Translation directory does not exist: i18n.",
		});

		const result = await runDoctor();

		expect(result.success).toBe(false);
		expect(result.checks).toEqual([
			{
				success: true,
				message: "Configuration loaded from tring.config.ts.",
			},
			{
				success: false,
				message: "Translation directory does not exist: i18n.",
			},
		]);

		expect(checkTranslationLayout).not.toHaveBeenCalled();
		expect(checkLocales).not.toHaveBeenCalled();
	});

	it("stops when the translation layout check fails", async () => {
		const config = {
			directory: "i18n",
			layout: "files",
			source: "en-US",
			locales: ["ar-SA"],
		};

		loadTringConfig.mockResolvedValue({
			configFile: "tring.config.ts",
			config,
		});

		checkConfiguration.mockReturnValue({
			success: true,
			message: "Configuration loaded from tring.config.ts.",
		});

		checkTranslationDirectory.mockResolvedValue({
			success: true,
			message: "Translation directory found: i18n.",
		});

		checkTranslationLayout.mockResolvedValue({
			success: false,
			message: "Source locale file does not exist: i18n/en-US.json",
		});

		const result = await runDoctor();

		expect(result.success).toBe(false);
		expect(result.checks).toHaveLength(3);

		expect(checkLocales).not.toHaveBeenCalled();
	});

	it("stops when the locales check fails", async () => {
		const config = {
			directory: "i18n",
			layout: "files",
			source: "en-US",
			locales: ["ar-SA"],
		};

		loadTringConfig.mockResolvedValue({
			configFile: "tring.config.ts",
			config,
		});

		checkConfiguration.mockReturnValue({
			success: true,
			message: "Configuration loaded from tring.config.ts.",
		});

		checkTranslationDirectory.mockResolvedValue({
			success: true,
			message: "Translation directory found: i18n.",
		});

		checkTranslationLayout.mockResolvedValue({
			success: true,
			message: "Translation layout: files (en-US.json).",
		});

		checkLocales.mockResolvedValue({
			success: false,
			message: "Locale does not exist: i18n/ar-SA.json",
		});

		const result = await runDoctor();

		expect(result.success).toBe(false);
		expect(result.checks).toHaveLength(4);
	});

	it("returns an error when loading the configuration fails", async () => {
		loadTringConfig.mockRejectedValue(new Error("Configuration error"));

		const result = await runDoctor();

		expect(result).toEqual({
			checks: [],
			success: false,
			error: "Failed to load Tring configuration. Run `tring init`.",
		});
	});
});
