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
			createIssue("missing-file", {
				locale: "ar-SA",
				file: "settings.json",
			}),
			createIssue("extra-file", {
				locale: "ar-SA",
				file: "extra.json",
			}),
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
			createIssue("unsorted", {
				locale: "ar-SA",
				file: "settings.json",
			}),
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
			createIssue("missing-file", {
				locale: "ar-SA",
				file: "settings.json",
			}),
			createIssue("extra-file", {
				locale: "fr-FR",
				file: "extra.json",
			}),
			createIssue("unsorted", {
				locale: "de-DE",
				file: "auth.json",
			}),
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
			createIssue("missing-file", {
				locale: "ar-SA",
				file: "settings.json",
			}),
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

	it("prints no output when GitHub mode has no issues", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCheckResult([], { github: true });

		expect(consoleLog).not.toHaveBeenCalled();
	});

	it("prints missing files as GitHub errors", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCheckResult(
			[
				createIssue("missing-file", {
					title: "Missing file",
					message: "Missing translation file.",
					locale: "ar-SA",
					file: "dashboard/analytics/reports.json",
					path: "app/i18n/ar-SA/dashboard/analytics/reports.json",
				}),
			],
			{ github: true },
		);

		expect(consoleLog).toHaveBeenCalledWith(
			"::error file=app/i18n/ar-SA/dashboard/analytics/reports.json,title=Missing file::Missing translation file.",
		);
	});

	it("prints extra files as GitHub errors", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCheckResult(
			[
				createIssue("extra-file", {
					title: "Extra file",
					message: "Extra translation file.",
					locale: "de-DE",
					file: "admin/legacy.json",
					path: "app/i18n/de-DE/admin/legacy.json",
				}),
			],
			{ github: true },
		);

		expect(consoleLog).toHaveBeenCalledWith(
			"::error file=app/i18n/de-DE/admin/legacy.json,title=Extra file::Extra translation file.",
		);
	});

	it("prints missing keys as GitHub errors", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCheckResult(
			[
				createIssue("missing-key", {
					title: "Missing key",
					message: "Missing translation key: status.active",
					locale: "de-DE",
					file: "admin/users.json",
					key: "status.active",
					path: "app/i18n/de-DE/admin/users.json",
				}),
			],
			{ github: true },
		);

		expect(consoleLog).toHaveBeenCalledWith(
			"::error file=app/i18n/de-DE/admin/users.json,title=Missing key::Missing translation key: status.active",
		);
	});

	it("prints extra keys as GitHub errors", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCheckResult(
			[
				createIssue("extra-key", {
					title: "Extra key",
					message: "Extra translation key: debug",
					locale: "fr-FR",
					file: "auth.json",
					key: "debug",
					path: "app/i18n/fr-FR/auth.json",
				}),
			],
			{ github: true },
		);

		expect(consoleLog).toHaveBeenCalledWith(
			"::error file=app/i18n/fr-FR/auth.json,title=Extra key::Extra translation key: debug",
		);
	});

	it("prints empty values as GitHub warnings", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCheckResult(
			[
				createIssue("empty-value", {
					title: "Empty value",
					message: "Empty translation value: status.active",
					locale: "fr-FR",
					file: "settings.json",
					key: "status.active",
					path: "app/i18n/fr-FR/settings.json",
				}),
			],
			{ github: true },
		);

		expect(consoleLog).toHaveBeenCalledWith(
			"::warning file=app/i18n/fr-FR/settings.json,title=Empty value::Empty translation value: status.active",
		);
	});

	it("prints unsorted files as GitHub errors", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCheckResult(
			[
				createIssue("unsorted", {
					title: "Unsorted",
					message: "Translation keys are not sorted.",
					locale: "ar-SA",
					file: "admin/users.json",
					path: "app/i18n/ar-SA/admin/users.json",
				}),
			],
			{ github: true },
		);

		expect(consoleLog).toHaveBeenCalledWith(
			"::error file=app/i18n/ar-SA/admin/users.json,title=Unsorted::Translation keys are not sorted.",
		);
	});

	it("prints multiple GitHub annotations without the normal check output", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCheckResult(
			[
				createIssue("missing-file", {
					title: "Missing file",
					message: "Missing translation file.",
					locale: "ar-SA",
					file: "dashboard/analytics/reports.json",
					path: "app/i18n/ar-SA/dashboard/analytics/reports.json",
				}),
				createIssue("missing-key", {
					title: "Missing key",
					message: "Missing translation key: status.active",
					locale: "de-DE",
					file: "admin/users.json",
					key: "status.active",
					path: "app/i18n/de-DE/admin/users.json",
				}),
				createIssue("empty-value", {
					title: "Empty value",
					message: "Empty translation value: status.active",
					locale: "fr-FR",
					file: "settings.json",
					key: "status.active",
					path: "app/i18n/fr-FR/settings.json",
				}),
			],
			{ github: true },
		);

		const output = consoleLog.mock.calls.flat().join("\n");

		expect(output).toContain(
			"::error file=app/i18n/ar-SA/dashboard/analytics/reports.json,title=Missing file::Missing translation file.",
		);

		expect(output).toContain(
			"::error file=app/i18n/de-DE/admin/users.json,title=Missing key::Missing translation key: status.active",
		);

		expect(output).toContain(
			"::warning file=app/i18n/fr-FR/settings.json,title=Empty value::Empty translation value: status.active",
		);

		expect(output).not.toContain("Translation check found");
	});
});

function createIssue(
	type: TranslationCheckIssue["type"],
	overrides: Partial<TranslationCheckIssue> = {},
): TranslationCheckIssue {
	return {
		title: "Test issue",
		type,
		message: "Test issue message",
		locale: "ar-SA",
		file: "auth.json",
		path: "app/i18n/ar-SA/auth.json",
		...overrides,
	};
}
