import { describe, expect, it } from "vitest";

import { formatTranslationReport, type TranslationReport } from "@/translation";

describe("formatTranslationReport", () => {
	it("formats a report with translation problems", () => {
		const report: TranslationReport = {
			source: "en-US",
			target: "ar-SA",

			files: {
				missing: [
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

				extra: [
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

				matched: [
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
				],
			},

			keys: {
				missing: [
					{
						key: "auth.login.button",
						locale: "ar-SA",
						fileKey: "auth.json",
					},
					{
						key: "profile.email",
						locale: "ar-SA",
						fileKey: "common/profile.json",
					},
				],
				extra: [
					{
						key: "auth.login.dec",
						locale: "ar-SA",
						fileKey: "auth.json",
					},
				],
			},

			summary: {
				filesMissing: 1,
				filesExtra: 1,
				keysMissing: 2,
				extraKeys: 1,
			},
		};

		expect(formatTranslationReport(report)).toBe(
			[
				"Translation Analysis",
				"",
				"Source: en-US",
				"Target: ar-SA",
				"",
				"Files Missing",
				"  ✗ admin/settings.json | en-US",
				"",
				"Files Extra",
				"  • admin/legacy.json | ar-SA",
				"",
				"Keys Missing",
				"  ✗ auth.login.button | ar-SA | auth.json",
				"  ✗ profile.email | ar-SA | common/profile.json",
				"",
				"Extra Keys",
				"  • auth.login.dec | ar-SA | auth.json",
				"",
				"Summary",
				"  Files missing: 1",
				"  Files extra: 1",
				"  Keys missing: 2",
				"  Extra keys: 1",
			].join("\n"),
		);
	});

	it("hides matched files by default", () => {
		const report: TranslationReport = {
			source: "en-US",
			target: "ar-SA",

			files: {
				missing: [],
				extra: [],
				matched: [
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
				],
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
		};

		expect(formatTranslationReport(report)).toBe(
			[
				"Translation Analysis",
				"",
				"Source: en-US",
				"Target: ar-SA",
				"",
				"Summary",
				"  Files missing: 0",
				"  Files extra: 0",
				"  Keys missing: 0",
				"  Extra keys: 0",
			].join("\n"),
		);
	});

	it("shows matched files when requested", () => {
		const report: TranslationReport = {
			source: "en-US",
			target: "ar-SA",

			files: {
				missing: [],
				extra: [],
				matched: [
					{
						source: {
							locale: "en-US",
							directory: "admin",
							name: "common",
							filename: "common.json",
							path: "/en-US/admin/common.json",
							key: "admin/common.json",
							isLocaleFile: false,
						},
						target: {
							locale: "ar-SA",
							directory: "admin",
							name: "common",
							filename: "common.json",
							path: "/ar-SA/admin/common.json",
							key: "admin/common.json",
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
						missingKeys: [],
						extraKeys: [],
					},
				],
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
		};

		expect(
			formatTranslationReport(report, {
				showFiles: true,
			}),
		).toBe(
			[
				"Translation Analysis",
				"",
				"Source: en-US",
				"Target: ar-SA",
				"",
				"Files",
				"  ✓ admin/common.json | en-US",
				"  ✓ auth/auth.json | en-US",
				"",
				"Summary",
				"  Files missing: 0",
				"  Files extra: 0",
				"  Keys missing: 0",
				"  Extra keys: 0",
			].join("\n"),
		);
	});
});
