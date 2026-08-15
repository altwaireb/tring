import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { analyzeApplication } from "@/app";
import { TranslationLayout } from "@/config";

const I18N_DIRECTORY = join(process.cwd(), "tests", "app", "i18n");

describe("analyzeApplication with files layout", () => {
	it("analyzes file-based translations", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "files"),
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await analyzeApplication(config);

		expect(result.reports).toHaveLength(1);

		const report = result.reports[0];

		expect(report).toBeDefined();

		if (!report) {
			throw new Error("Expected one translation report.");
		}

		expect(report.source).toBe("en-US");
		expect(report.target).toBe("ar-SA");

		expect(report.summary).toEqual({
			filesMissing: 0,
			filesExtra: 0,
			keysMissing: 0,
			extraKeys: 0,
		});
	});

	it("reports a missing locale file", async () => {
		const config = {
			directory: join(I18N_DIRECTORY, "files-missing"),
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA"],
		};

		const result = await analyzeApplication(config);

		expect(result.reports).toHaveLength(1);

		const report = result.reports[0];

		expect(report).toBeDefined();

		if (!report) {
			throw new Error("Expected one translation report.");
		}

		expect(report.summary).toEqual({
			filesMissing: 1,
			filesExtra: 0,
			keysMissing: 0,
			extraKeys: 0,
		});
	});
});
