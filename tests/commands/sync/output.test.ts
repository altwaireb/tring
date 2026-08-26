import { afterEach, describe, expect, it, vi } from "vitest";

import type { SyncCommandResult } from "@/cli/commands/sync";
import { printSyncResult } from "@/commands/sync/output";
import { logger } from "@/logger";

vi.mock("@/logger", () => ({
	logger: {
		newLine: vi.fn(),
		text: vi.fn(),
		info: vi.fn(),
		infoMark: vi.fn(),
		success: vi.fn(),
		successMark: vi.fn(),
		warningMark: vi.fn(),
		plus: vi.fn(),
		labelValue: vi.fn(),
	},
}));

function createResult(
	overrides: Partial<SyncCommandResult> = {},
): SyncCommandResult {
	const files = [
		{
			locale: "ar-SA",
			source: {
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/translations/en-US/common.json",
			},
			target: {
				locale: "ar-SA",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/translations/ar-SA/common.json",
			},
			targetPath: "/translations/ar-SA/common.json",
			displayPath: "ar-SA/common.json",
			changes: [
				{
					key: "login",
					sourceValue: "Login",
				},
				{
					key: "profile.title",
					sourceValue: "Profile",
				},
			],
		},
		{
			locale: "fr-FR",
			source: {
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/translations/en-US/common.json",
			},
			target: {
				locale: "fr-FR",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/translations/fr-FR/common.json",
			},
			targetPath: "/translations/fr-FR/common.json",
			displayPath: "fr-FR/common.json",
			changes: [
				{
					key: "logout",
					sourceValue: "Logout",
				},
			],
		},
	];

	return {
		exitCode: 0,
		plan: {
			files,
		},
		...overrides,
	};
}

function createSyncFile(
	locale: string,
	displayPath: string,
	target?: NonNullable<SyncCommandResult["plan"]["files"][number]["target"]>,
): SyncCommandResult["plan"]["files"][number] {
	return {
		locale,
		source: {
			locale: "en-US",
			directory: "",
			name: "common",
			filename: "common.json",
			key: "common.json",
			isLocaleFile: false,
			path: "/translations/en-US/common.json",
		},
		...(target === undefined ? {} : { target }),
		targetPath: `/translations/${displayPath}`,
		displayPath,
		changes: [
			{
				key: "title",
				sourceValue: "Title",
			},
		],
	};
}

describe("printSyncResult", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("prints the sync plan", () => {
		printSyncResult(createResult(), {
			empty: false,
		});

		expect(logger.infoMark).toHaveBeenCalledWith("Sync plan");

		expect(logger.plus).toHaveBeenNthCalledWith(1, "ar-SA/common.json", [
			'login = "Login"',
			'profile.title = "Profile"',
		]);

		expect(logger.plus).toHaveBeenNthCalledWith(2, "fr-FR/common.json", [
			'logout = "Logout"',
		]);
	});

	it("prints the dry-run summary", () => {
		printSyncResult(createResult(), {
			empty: false,
		});

		expect(logger.labelValue).toHaveBeenCalledWith("files will be changed", 2);

		expect(logger.labelValue).toHaveBeenCalledWith("files will be updated", 2);

		expect(logger.labelValue).toHaveBeenCalledWith(
			"translations will be added",
			3,
		);
	});

	it("prints an empty sync plan when there are no changes", () => {
		printSyncResult(
			{
				exitCode: 0,
				plan: {
					files: [],
				},
			},
			{
				empty: false,
			},
		);

		expect(logger.text).toHaveBeenCalledWith("Nothing to sync.");
		expect(logger.plus).not.toHaveBeenCalled();
	});

	it("prints created and updated files after apply", () => {
		const result = createResult({
			writeResult: {
				filesCreated: 1,
				filesUpdated: 1,
			},
		});

		printSyncResult(result, {
			empty: false,
		});

		expect(logger.infoMark).toHaveBeenCalledWith("Syncing translations");

		expect(logger.plus).toHaveBeenNthCalledWith(
			1,
			"Updated ar-SA/common.json",
			['login = "Login"', 'profile.title = "Profile"'],
		);

		expect(logger.plus).toHaveBeenNthCalledWith(
			2,
			"Updated fr-FR/common.json",
			['logout = "Logout"'],
		);

		expect(logger.successMark).toHaveBeenCalledWith("Sync complete");
		expect(logger.labelValue).toHaveBeenCalledWith("files changed", 2);
		expect(logger.labelValue).toHaveBeenCalledWith("files created", 1);
		expect(logger.labelValue).toHaveBeenCalledWith("files updated", 1);
		expect(logger.labelValue).toHaveBeenCalledWith("translations added", 3);
	});

	it("prints empty values when empty mode is enabled", () => {
		printSyncResult(createResult(), {
			empty: true,
		});

		expect(logger.plus).toHaveBeenNthCalledWith(1, "ar-SA/common.json", [
			'login = ""',
			'profile.title = ""',
		]);

		expect(logger.plus).toHaveBeenNthCalledWith(2, "fr-FR/common.json", [
			'logout = ""',
		]);
	});

	it("prints a singular summary correctly", () => {
		const baseResult = createResult();
		const firstFile = baseResult.plan.files[0];

		if (!firstFile) {
			throw new Error("Expected the test fixture to contain a file.");
		}

		const result = createResult({
			plan: {
				files: [firstFile],
			},
		});

		printSyncResult(result, {
			empty: false,
		});

		expect(logger.labelValue).toHaveBeenCalledWith("files will be changed", 1);

		expect(logger.labelValue).toHaveBeenCalledWith("files will be updated", 1);

		expect(logger.labelValue).toHaveBeenCalledWith(
			"translations will be added",
			2,
		);
	});

	it("sorts created files before updated files by locale and path", () => {
		const result = createResult({
			plan: {
				files: [
					createSyncFile("fr-FR", "fr-FR/zeta.json"),
					createSyncFile("ar-SA", "ar-SA/common.json", {
						locale: "ar-SA",
						directory: "",
						name: "common",
						filename: "common.json",
						key: "common.json",
						isLocaleFile: false,
						path: "/translations/ar-SA/common.json",
					}),
					createSyncFile("de-DE", "de-DE/settings.json"),
					createSyncFile("de-DE", "de-DE/admin.json"),
					createSyncFile("fr-FR", "fr-FR/common.json", {
						locale: "fr-FR",
						directory: "",
						name: "common",
						filename: "common.json",
						key: "common.json",
						isLocaleFile: false,
						path: "/translations/fr-FR/common.json",
					}),
				],
			},
		});

		printSyncResult(result, {
			empty: false,
		});

		expect(logger.plus).toHaveBeenNthCalledWith(
			1,
			"de-DE/admin.json",
			expect.any(Array),
		);

		expect(logger.plus).toHaveBeenNthCalledWith(
			2,
			"de-DE/settings.json",
			expect.any(Array),
		);

		expect(logger.plus).toHaveBeenNthCalledWith(
			3,
			"fr-FR/zeta.json",
			expect.any(Array),
		);

		expect(logger.plus).toHaveBeenNthCalledWith(
			4,
			"ar-SA/common.json",
			expect.any(Array),
		);

		expect(logger.plus).toHaveBeenNthCalledWith(
			5,
			"fr-FR/common.json",
			expect.any(Array),
		);
	});
});
