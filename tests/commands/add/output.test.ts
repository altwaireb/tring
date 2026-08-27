import { afterEach, describe, expect, it, vi } from "vitest";

import type { AddCommandResult } from "@/cli/commands/add";
import { printAddResult } from "@/commands/add/output";
import { logger } from "@/logger";

vi.mock("@/logger", () => ({
	logger: {
		newLine: vi.fn(),
		text: vi.fn(),
		info: vi.fn(),
		infoMark: vi.fn(),
		success: vi.fn(),
		successMark: vi.fn(),
		warning: vi.fn(),
		warningMark: vi.fn(),
		plus: vi.fn(),
		plusMark: vi.fn(),
		bulletMark: vi.fn(),
		labelValue: vi.fn(),
	},
}));

function createResult(
	overrides: Partial<AddCommandResult> = {},
): AddCommandResult {
	return {
		exitCode: 0,
		plan: {
			files: [
				{
					locale: "ar-SA",
					source: {
						locale: "en-US",
						directory: "admin",
						name: "users",
						filename: "users.json",
						key: "admin/users.json",
						isLocaleFile: false,
						path: "/translations/en-US/admin/users.json",
					},
					targetPath: "/translations/ar-SA/admin/users.json",
					displayPath: "ar-SA/admin/users.json",
					changes: [
						{
							key: "status.active",
							sourceValue: "Active",
						},
						{
							key: "status.inactive",
							sourceValue: "Inactive",
						},
					],
				},
				{
					locale: "de-DE",
					source: {
						locale: "en-US",
						directory: "admin",
						name: "users",
						filename: "users.json",
						key: "admin/users.json",
						isLocaleFile: false,
						path: "/translations/en-US/admin/users.json",
					},
					target: {
						locale: "de-DE",
						directory: "admin",
						name: "users",
						filename: "users.json",
						key: "admin/users.json",
						isLocaleFile: false,
						path: "/translations/de-DE/admin/users.json",
					},
					targetPath: "/translations/de-DE/admin/users.json",
					displayPath: "de-DE/admin/users.json",
					changes: [
						{
							key: "status.active",
							sourceValue: "Active",
						},
						{
							key: "status.inactive",
							sourceValue: "Inactive",
						},
					],
				},
			],
		},
		skippedLocales: ["fr-FR"],
		writeResult: {
			filesCreated: 1,
			filesUpdated: 1,
		},
		...overrides,
	};
}

describe("printAddResult", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("prints added and skipped locales for a file", () => {
		printAddResult(createResult(), {
			empty: false,
			file: "admin/users.json",
		});

		expect(logger.successMark).toHaveBeenCalledWith('Added "admin/users.json"');

		expect(logger.plusMark).toHaveBeenNthCalledWith(1, "ar-SA", {
			indent: 5,
		});

		expect(logger.plusMark).toHaveBeenNthCalledWith(2, "de-DE", {
			indent: 5,
		});

		expect(logger.warningMark).toHaveBeenCalledWith(
			"Skipped where the file already contains all keys",
			{ indent: 2 },
		);

		expect(logger.bulletMark).toHaveBeenCalledWith("fr-FR", {
			indent: 5,
		});

		expect(logger.successMark).toHaveBeenCalledWith("Add complete");
	});

	it("prints nothing when there are no added or skipped locales", () => {
		const result = createResult({
			plan: {
				files: [],
			},
			skippedLocales: [],
			writeResult: {
				filesCreated: 0,
				filesUpdated: 0,
			},
		});

		printAddResult(result, {
			empty: false,
			file: "admin/users.json",
		});

		expect(logger.text).toHaveBeenCalledWith("Nothing to add.");
		expect(logger.successMark).not.toHaveBeenCalled();
		expect(logger.plusMark).not.toHaveBeenCalled();
		expect(logger.bulletMark).not.toHaveBeenCalled();
	});

	it("sorts added and skipped locales alphabetically", () => {
		const baseResult = createResult();
		const firstFile = baseResult.plan.files[0];
		const secondFile = baseResult.plan.files[1];

		if (!firstFile || !secondFile) {
			throw new Error("Expected the test fixture to contain two files.");
		}

		const result = createResult({
			plan: {
				files: [secondFile, firstFile],
			},
			skippedLocales: ["fr-FR", "ar-SA"],
		});

		printAddResult(result, {
			empty: false,
			file: "admin/users.json",
		});

		expect(logger.plusMark).toHaveBeenNthCalledWith(1, "ar-SA", {
			indent: 5,
		});

		expect(logger.plusMark).toHaveBeenNthCalledWith(2, "de-DE", {
			indent: 5,
		});

		expect(logger.bulletMark).toHaveBeenNthCalledWith(1, "ar-SA", {
			indent: 5,
		});

		expect(logger.bulletMark).toHaveBeenNthCalledWith(2, "fr-FR", {
			indent: 5,
		});
	});

	it("prints empty values mode", () => {
		printAddResult(createResult(), {
			empty: true,
			file: "admin/users.json",
		});

		expect(logger.warning).toHaveBeenCalledWith("Empty values mode");
	});

	it("prints locale-based add output", () => {
		printAddResult(createResult(), {
			empty: false,
		});

		expect(logger.infoMark).toHaveBeenCalledWith("Adding translations");

		expect(logger.plus).toHaveBeenNthCalledWith(
			1,
			"Created ar-SA/admin/users.json",
			['status.active = "Active"', 'status.inactive = "Inactive"'],
		);

		expect(logger.plus).toHaveBeenNthCalledWith(
			2,
			"Updated de-DE/admin/users.json",
			['status.active = "Active"', 'status.inactive = "Inactive"'],
		);

		expect(logger.labelValue).toHaveBeenCalledWith("files changed", 2);
		expect(logger.labelValue).toHaveBeenCalledWith("files created", 1);
		expect(logger.labelValue).toHaveBeenCalledWith("files updated", 1);
		expect(logger.labelValue).toHaveBeenCalledWith("translations added", 4);

		expect(logger.successMark).toHaveBeenCalledWith("Add complete");
	});

	it("prints empty values for locale-based add", () => {
		printAddResult(createResult(), {
			empty: true,
		});

		expect(logger.plus).toHaveBeenNthCalledWith(
			1,
			"Created ar-SA/admin/users.json",
			['status.active = ""', 'status.inactive = ""'],
		);

		expect(logger.plus).toHaveBeenNthCalledWith(
			2,
			"Updated de-DE/admin/users.json",
			['status.active = ""', 'status.inactive = ""'],
		);
	});
});
