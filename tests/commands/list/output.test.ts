import { describe, expect, it, vi } from "vitest";

import type { ListApplicationResult } from "@/app";
import { printListResources } from "@/commands/list/output";
import { MESSAGES } from "@/messages";
import type { TranslationFile } from "@/translation";

function createTranslationFile(key: string, locale = "en-US"): TranslationFile {
	const parts = key.split("/");
	const filename = parts.at(-1) ?? key;
	const directory = parts.slice(0, -1).join("/");

	const name = filename.endsWith(".json") ? filename.slice(0, -5) : filename;

	return {
		locale,
		directory,
		name,
		filename,
		key,
		isLocaleFile: false,
		path: `${locale}/${key}`,
	};
}

function createResult(): ListApplicationResult {
	return {
		source: "en-US",
		resources: [
			{
				locale: "en-US",
				files: [
					createTranslationFile("auth.json"),
					createTranslationFile("common.json"),
					createTranslationFile("settings.json"),
					createTranslationFile("admin/roles.json"),
					createTranslationFile("admin/users.json"),
					createTranslationFile("dashboard/overview.json"),
					createTranslationFile("dashboard/analytics/reports.json"),
					createTranslationFile("notifications/email.json"),
				],
			},
			{
				locale: "ar-SA",
				files: [
					createTranslationFile("auth.json", "ar-SA"),
					createTranslationFile("common.json", "ar-SA"),
					createTranslationFile("settings.json", "ar-SA"),
					createTranslationFile("admin/roles.json", "ar-SA"),
					createTranslationFile("admin/users.json", "ar-SA"),
					createTranslationFile("dashboard/overview.json", "ar-SA"),
					createTranslationFile("notifications/email.json", "ar-SA"),
				],
			},
		],
	};
}

describe("printListResources", () => {
	it("prints the translation resources title", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printListResources(createResult());

		expect(consoleLog).toHaveBeenCalledWith(MESSAGES.translationResources);

		consoleLog.mockRestore();
	});

	it("prints the source", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printListResources(createResult());

		expect(consoleLog).toHaveBeenCalledWith("Source  │  en-US");

		consoleLog.mockRestore();
	});

	it("prints resource locales and file counts", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printListResources(createResult());

		expect(consoleLog).toHaveBeenCalledWith("en-US (8 files)");
		expect(consoleLog).toHaveBeenCalledWith("ar-SA (7 files)");

		consoleLog.mockRestore();
	});

	it("does not print files by default", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printListResources(createResult());

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).not.toContain("auth.json");
		expect(output).not.toContain("admin/");
		expect(output).not.toContain("dashboard/");

		consoleLog.mockRestore();
	});

	it("prints files when showFiles is enabled", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printListResources(createResult(), {
			showFiles: true,
		});

		expect(consoleLog).toHaveBeenCalledWith("  auth.json");
		expect(consoleLog).toHaveBeenCalledWith("  common.json");
		expect(consoleLog).toHaveBeenCalledWith("  settings.json");

		expect(consoleLog).toHaveBeenCalledWith("  admin/");
		expect(consoleLog).toHaveBeenCalledWith("    roles.json");
		expect(consoleLog).toHaveBeenCalledWith("    users.json");

		expect(consoleLog).toHaveBeenCalledWith("  dashboard/");
		expect(consoleLog).toHaveBeenCalledWith("    overview.json");
		expect(consoleLog).toHaveBeenCalledWith("    analytics/");
		expect(consoleLog).toHaveBeenCalledWith("      reports.json");

		expect(consoleLog).toHaveBeenCalledWith("  notifications/");
		expect(consoleLog).toHaveBeenCalledWith("    email.json");

		consoleLog.mockRestore();
	});

	it("prints a singular file label", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const result: ListApplicationResult = {
			source: "en-US",
			resources: [
				{
					locale: "en-US",
					files: [createTranslationFile("en-US.json")],
				},
			],
		};

		printListResources(result);

		expect(consoleLog).toHaveBeenCalledWith("en-US (1 file)");

		consoleLog.mockRestore();
	});

	it("prints multiple resources", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printListResources(createResult());

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain("en-US (8 files)");
		expect(output).toContain("ar-SA (7 files)");

		consoleLog.mockRestore();
	});
});
