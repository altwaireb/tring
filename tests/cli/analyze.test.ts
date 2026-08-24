import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runAnalyzeCommand } from "@/cli/commands/analyze";
import { TranslationLayout } from "@/config";

const I18N_DIRECTORY = join(process.cwd(), "tests", "app", "i18n");

describe("runAnalyzeCommand", () => {
	it("analyzes all configured locales", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "valid"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await runAnalyzeCommand(config);

		expect(result.exitCode).toBe(0);
		expect(result.reports).toHaveLength(1);
		expect(result.reports[0]?.source).toBe("en-US");
		expect(result.reports[0]?.target).toBe("ar-SA");
	});

	it("analyzes only the requested locale", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "valid"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await runAnalyzeCommand(config, {
			targetLocale: "ar-SA",
		});

		expect(result.exitCode).toBe(0);
		expect(result.reports).toHaveLength(1);
		expect(result.reports[0]?.target).toBe("ar-SA");
	});

	it("rejects an unconfigured locale", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "valid"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await runAnalyzeCommand(config, {
			targetLocale: "fr-FR",
		});

		expect(result.exitCode).toBe(1);
		expect(result.reports).toHaveLength(0);
	});

	it("returns exit code 1 when translations have problems", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "missing-keys"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await runAnalyzeCommand(config);

		expect(result.exitCode).toBe(1);
		expect(result.reports).toHaveLength(1);

		const report = result.reports[0];

		expect(report?.keys.missing).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: "forgot_password",
				}),
				expect.objectContaining({
					key: "create_account",
				}),
			]),
		);
	});

	it("returns exit code 1 when the locale is not configured", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "missing-locale"),
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await runAnalyzeCommand(config, {
			targetLocale: "fr-FR",
		});

		expect(result.exitCode).toBe(1);
		expect(result.reports).toHaveLength(0);
	});
});
