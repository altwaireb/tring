import { describe, expect, it } from "vitest";

import {
	createTranslationReport,
	type TranslationAnalysis,
} from "@/translation";

describe("createTranslationReport", () => {
	it("creates a report from translation analysis", () => {
		const analysis: TranslationAnalysis = {
			sourceLocale: "en-US",
			targetLocale: "ar-SA",

			missingFiles: [
				{
					locale: "en-US",
					directory: "admin",
					name: "settings",
					filename: "settings.json",
					path: "/en-US/admin/settings.json",
					key: "admin/settings.json",
					isLocaleFile: false,
				},
			],

			extraFiles: [
				{
					locale: "ar-SA",
					directory: "admin",
					name: "legacy",
					filename: "legacy.json",
					path: "/ar-SA/admin/legacy.json",
					key: "admin/legacy.json",
					isLocaleFile: false,
				},
			],

			files: [
				{
					source: {
						locale: "en-US",
						directory: "",
						name: "common",
						filename: "common.json",
						path: "/en-US/common.json",
						key: "common.json",
						isLocaleFile: false,
					},
					target: {
						locale: "ar-SA",
						directory: "",
						name: "common",
						filename: "common.json",
						path: "/ar-SA/common.json",
						key: "common.json",
						isLocaleFile: false,
					},
					missingKeys: [],
					extraKeys: [],
				},
				{
					source: {
						locale: "en-US",
						directory: "auth",
						name: "auth",
						filename: "auth.json",
						path: "/en-US/auth/auth.json",
						key: "auth/auth.json",
						isLocaleFile: false,
					},
					target: {
						locale: "ar-SA",
						directory: "auth",
						name: "auth",
						filename: "auth.json",
						path: "/ar-SA/auth/auth.json",
						key: "auth/auth.json",
						isLocaleFile: false,
					},
					missingKeys: ["auth.login.button", "profile.email"],
					extraKeys: ["auth.login.dec"],
				},
			],
		};

		expect(createTranslationReport(analysis)).toEqual({
			source: "en-US",
			target: "ar-SA",

			files: {
				missing: analysis.missingFiles,
				extra: analysis.extraFiles,
				matched: analysis.files,
			},

			keys: {
				missing: [
					{
						key: "auth.login.button",
						locale: "ar-SA",
						fileKey: "auth/auth.json",
					},
					{
						key: "profile.email",
						locale: "ar-SA",
						fileKey: "auth/auth.json",
					},
				],
				extra: [
					{
						key: "auth.login.dec",
						locale: "ar-SA",
						fileKey: "auth/auth.json",
					},
				],
			},

			summary: {
				filesMissing: 1,
				filesExtra: 1,
				keysMissing: 2,
				extraKeys: 1,
			},
		});
	});

	it("keeps locales when there are no matched files", () => {
		const analysis: TranslationAnalysis = {
			sourceLocale: "en-US",
			targetLocale: "ar-SA",

			missingFiles: [
				{
					locale: "en-US",
					directory: "",
					name: "common",
					filename: "common.json",
					path: "/en-US/common.json",
					key: "common.json",
					isLocaleFile: false,
				},
			],

			extraFiles: [],

			files: [],
		};

		expect(createTranslationReport(analysis)).toEqual({
			source: "en-US",
			target: "ar-SA",

			files: {
				missing: analysis.missingFiles,
				extra: [],
				matched: [],
			},

			keys: {
				missing: [],
				extra: [],
			},

			summary: {
				filesMissing: 1,
				filesExtra: 0,
				keysMissing: 0,
				extraKeys: 0,
			},
		});
	});

	it("preserves file keys in missing and extra files", () => {
		const missingFile = {
			locale: "en-US",
			directory: "admin",
			name: "common",
			filename: "common.json",
			path: "/en-US/admin/common.json",
			key: "admin/common.json",
			isLocaleFile: false,
		};

		const extraFile = {
			locale: "ar-SA",
			directory: "user",
			name: "common",
			filename: "common.json",
			path: "/ar-SA/user/common.json",
			key: "user/common.json",
			isLocaleFile: false,
		};

		const analysis: TranslationAnalysis = {
			sourceLocale: "en-US",
			targetLocale: "ar-SA",
			missingFiles: [missingFile],
			extraFiles: [extraFile],
			files: [],
		};

		const report = createTranslationReport(analysis);

		expect(report.files.missing).toEqual([missingFile]);
		expect(report.files.extra).toEqual([extraFile]);
	});
});
