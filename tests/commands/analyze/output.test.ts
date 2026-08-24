import { afterEach, describe, expect, it, vi } from "vitest";
import {
	printAnalyzeReport,
	printAnalyzeReports,
} from "@/commands/analyze/output";
import { MESSAGES } from "@/messages";
import type {
	TranslationFile,
	TranslationFileAnalysis,
	TranslationReport,
} from "@/translation";

describe("printAnalyzeReport", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("prints the translation analysis title", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport();

		printAnalyzeReport(report);

		expect(consoleLog).toHaveBeenCalledWith(MESSAGES.title);
	});

	it("prints the source and target", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport();

		printAnalyzeReport(report);

		expect(consoleLog).toHaveBeenCalledWith(
			`${MESSAGES.source}  │  ${report.source}`,
		);

		expect(consoleLog).toHaveBeenCalledWith(
			`${MESSAGES.target}  │  ${report.target}`,
		);
	});

	it("prints matched files when showFiles is enabled", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport({
			files: {
				matched: [
					createTranslationFileAnalysis({
						source: createTranslationFile({
							key: "auth",
							locale: "en-US",
						}),
					}),
				],
				missing: [],
				extra: [],
			},
		});

		printAnalyzeReport(report, {
			showFiles: true,
		});

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.files);
		expect(output).toContain("auth");
		expect(output).toContain("en-US");
	});

	it("does not print matched files when showFiles is disabled", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport({
			files: {
				matched: [
					createTranslationFileAnalysis({
						source: createTranslationFile({
							key: "auth",
							locale: "en-US",
						}),
					}),
				],
				missing: [],
				extra: [],
			},
		});

		printAnalyzeReport(report);

		expect(consoleLog).not.toHaveBeenCalledWith(MESSAGES.files);
	});

	it("prints missing files", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport({
			files: {
				matched: [],
				missing: [
					createTranslationFile({
						key: "auth",
						locale: "ar-SA",
					}),
				],
				extra: [],
			},
		});

		printAnalyzeReport(report);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.filesMissing);
		expect(output).toContain("auth");
		expect(output).toContain("ar-SA");
	});

	it("prints extra files", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport({
			files: {
				matched: [],
				missing: [],
				extra: [
					createTranslationFile({
						key: "auth",
						locale: "ar-SA",
					}),
				],
			},
		});

		printAnalyzeReport(report);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.filesExtra);
		expect(output).toContain("auth");
		expect(output).toContain("ar-SA");
	});

	it("prints missing keys", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport({
			keys: {
				missing: [
					{
						key: "forgot_password",
						locale: "ar-SA",
						fileKey: "auth",
					},
				],
				extra: [],
			},
		});

		printAnalyzeReport(report);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.keysMissing);
		expect(output).toContain("forgot_password");
		expect(output).toContain("ar-SA");
		expect(output).toContain("auth");
	});

	it("prints extra keys", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport({
			keys: {
				missing: [],
				extra: [
					{
						key: "create_account",
						locale: "ar-SA",
						fileKey: "auth",
					},
				],
			},
		});

		printAnalyzeReport(report);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.extraKeys);
		expect(output).toContain("create_account");
		expect(output).toContain("ar-SA");
		expect(output).toContain("auth");
	});

	it("prints the summary", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const report = createReport();

		printAnalyzeReport(report);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(MESSAGES.summary);
		expect(output).toContain(MESSAGES.filesMissingSummary);
		expect(output).toContain(MESSAGES.filesExtraSummary);
		expect(output).toContain(MESSAGES.keysMissingSummary);
		expect(output).toContain(MESSAGES.extraKeysSummary);
	});

	it("prints multiple reports with a blank line between them", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const reports = [
			createReport({
				source: "en-US",
				target: "ar-SA",
			}),
			createReport({
				source: "en-US",
				target: "fr-FR",
			}),
		];

		printAnalyzeReports(reports);

		expect(consoleLog).toHaveBeenCalledWith();
		expect(consoleLog.mock.calls.flat().join("\n")).toContain("ar-SA");
		expect(consoleLog.mock.calls.flat().join("\n")).toContain("fr-FR");
	});
});

function createTranslationFile(
	overrides: Partial<TranslationFile> = {},
): TranslationFile {
	return {
		key: "auth",
		locale: "en-US",
		directory: "auth",
		name: "auth",
		filename: "auth.json",
		isLocaleFile: true,
		path: "/tests/i18n/auth.json",
		...overrides,
	};
}

function createTranslationFileAnalysis(
	overrides: Partial<TranslationFileAnalysis> = {},
): TranslationFileAnalysis {
	return {
		source: createTranslationFile(),
		target: createTranslationFile({
			locale: "ar-SA",
		}),
		missingKeys: [],
		extraKeys: [],
		...overrides,
	};
}

function createReport(
	overrides: Partial<TranslationReport> = {},
): TranslationReport {
	return {
		source: "en-US",
		target: "ar-SA",
		files: {
			matched: [],
			missing: [],
			extra: [],
		},
		keys: {
			missing: [],
			extra: [],
		},
		summary: {
			filesMissing: 0,
			filesExtra: 0,
			keysMissing: 0,
			extraKeys: 0,
		},
		...overrides,
	};
}
