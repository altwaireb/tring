import { afterEach, describe, expect, it, vi } from "vitest";
import type { TranslationCheckIssue } from "@/app";
import { printCheckResult } from "@/commands/check/output";

describe("printCheckResult", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});
	it("prints a success message when there are no issues", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
		printCheckResult([]);
		const output = consoleLog.mock.calls.flat().join("\n");
		expect(output).toContain("Translation check passed");
	});
	it("prints the issue summary", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
		printCheckResult([
			createIssue("missing-file"),
			createIssue("extra-file"),
			createIssue("missing-key"),
			createIssue("extra-key"),
			createIssue("empty-value"),
			createIssue("unsorted"),
		]);
		const output = consoleLog.mock.calls.flat().join("\n");
		expect(output).toContain("Translation check found 6 issues");
		expect(output).toContain("Missing files");
		expect(output).toContain("Extra files");
		expect(output).toContain("Missing keys");
		expect(output).toContain("Extra keys");
		expect(output).toContain("Empty values");
		expect(output).toContain("Unsorted");
	});
	it("prints all issue groups", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
		printCheckResult([
			createIssue("missing-file", { locale: "ar-SA", file: "settings.json" }),
			createIssue("extra-file", { locale: "ar-SA", file: "extra.json" }),
			createIssue("missing-key", {
				locale: "ar-SA",
				file: "auth.json",
				key: "forgot_password",
			}),
			createIssue("extra-key", {
				locale: "ar-SA",
				file: "auth.json",
				key: "debug",
			}),
			createIssue("empty-value", {
				locale: "ar-SA",
				file: "auth.json",
				key: "login_button",
			}),
			createIssue("unsorted", { locale: "ar-SA", file: "settings.json" }),
		]);
		const output = consoleLog.mock.calls.flat().join("\n");
		expect(output).toContain("settings.json");
		expect(output).toContain("extra.json");
		expect(output).toContain("forgot_password");
		expect(output).toContain("debug");
		expect(output).toContain("login_button");
	});
	it("prints locale and file for file issues", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
		printCheckResult([
			createIssue("missing-file", { locale: "ar-SA", file: "settings.json" }),
			createIssue("extra-file", { locale: "fr-FR", file: "extra.json" }),
			createIssue("unsorted", { locale: "de-DE", file: "auth.json" }),
		]);
		const output = consoleLog.mock.calls.flat().join("\n");
		expect(output).toContain("ar-SA");
		expect(output).toContain("settings.json");
		expect(output).toContain("fr-FR");
		expect(output).toContain("extra.json");
		expect(output).toContain("de-DE");
		expect(output).toContain("auth.json");
	});
	it("prints locale, file, and key for key issues", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
		printCheckResult([
			createIssue("missing-key", {
				locale: "ar-SA",
				file: "auth.json",
				key: "forgot_password",
			}),
			createIssue("extra-key", {
				locale: "fr-FR",
				file: "settings.json",
				key: "debug",
			}),
			createIssue("empty-value", {
				locale: "de-DE",
				file: "profile.json",
				key: "display_name",
			}),
		]);
		const output = consoleLog.mock.calls.flat().join("\n");
		expect(output).toContain("ar-SA");
		expect(output).toContain("auth.json");
		expect(output).toContain("forgot_password");
		expect(output).toContain("fr-FR");
		expect(output).toContain("settings.json");
		expect(output).toContain("debug");
		expect(output).toContain("de-DE");
		expect(output).toContain("profile.json");
		expect(output).toContain("display_name");
	});
	it("prints empty values as warnings", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
		printCheckResult([
			createIssue("empty-value", {
				locale: "ar-SA",
				file: "auth.json",
				key: "login_button",
			}),
		]);
		const output = consoleLog.mock.calls.flat().join("\n");
		expect(output).toContain("Empty values");
		expect(output).toContain("login_button");
		expect(output).toContain("⚠");
	});
	it("prints other issues as errors", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
		printCheckResult([
			createIssue("missing-file", { locale: "ar-SA", file: "settings.json" }),
		]);
		const output = consoleLog.mock.calls.flat().join("\n");
		expect(output).toContain("Missing files");
		expect(output).toContain("settings.json");
		expect(output).toContain("✗");
	});
	it("keeps issue groups in a stable order", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
		printCheckResult([
			createIssue("unsorted"),
			createIssue("empty-value"),
			createIssue("extra-key"),
			createIssue("missing-key"),
			createIssue("extra-file"),
			createIssue("missing-file"),
		]);
		const output = consoleLog.mock.calls.flat().join("\n");
		expect(output.indexOf("Missing files")).toBeLessThan(
			output.indexOf("Extra files"),
		);
		expect(output.indexOf("Extra files")).toBeLessThan(
			output.indexOf("Missing keys"),
		);
		expect(output.indexOf("Missing keys")).toBeLessThan(
			output.indexOf("Extra keys"),
		);
		expect(output.indexOf("Extra keys")).toBeLessThan(
			output.indexOf("Empty values"),
		);
		expect(output.indexOf("Empty values")).toBeLessThan(
			output.indexOf("Unsorted"),
		);
	});
});
function createIssue(
	type: TranslationCheckIssue["type"],
	overrides: Partial<TranslationCheckIssue> = {},
): TranslationCheckIssue {
	return { type, locale: "ar-SA", file: "auth.json", ...overrides };
}
