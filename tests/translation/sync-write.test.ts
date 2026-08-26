import { afterEach, describe, expect, it, vi } from "vitest";

import type { TringConfig } from "@/config";
import { TranslationLayout } from "@/config";
import { read, write } from "@/filesystem";

import {
	applyTranslationSyncPlan,
	type TranslationSyncWritePlan,
} from "@/translation/sync-write";

vi.mock("@/filesystem", async () => {
	const actual =
		await vi.importActual<typeof import("@/filesystem")>("@/filesystem");

	return {
		...actual,
		mkdir: vi.fn(),
		read: vi.fn(),
		write: vi.fn(),
	};
});

const mockedRead = vi.mocked(read);
const mockedWrite = vi.mocked(write);

function createConfig(overrides: Partial<TringConfig> = {}): TringConfig {
	return {
		directory: "tests/app/i18n",
		layout: TranslationLayout.directories,
		source: "en-US",
		locales: ["ar-SA"],
		...overrides,
	};
}

function createPlan(
	overrides: Partial<TranslationSyncWritePlan["files"][number]> = {},
	withoutTarget = false,
): TranslationSyncWritePlan {
	const file = {
		locale: "ar-SA",
		source: {
			locale: "en-US",
			directory: "",
			name: "common",
			filename: "common.json",
			key: "common.json",
			isLocaleFile: false,
			path: "tests/app/i18n/en-US/common.json",
		},
		target: {
			locale: "ar-SA",
			directory: "",
			name: "common",
			filename: "common.json",
			key: "common.json",
			isLocaleFile: false,
			path: "tests/app/i18n/ar-SA/common.json",
		},
		targetPath: "tests/app/i18n/ar-SA/common.json",
		displayPath: "ar-SA/common.json",
		changes: [
			{
				key: "login",
				sourceValue: "Login",
			},
		],
		...overrides,
	};

	if (withoutTarget) {
		const { target: _target, ...fileWithoutTarget } = file;

		return {
			files: [
				{
					...fileWithoutTarget,
					displayPath: file.displayPath,
				},
			],
		};
	}

	return {
		files: [file],
	};
}

afterEach(() => {
	vi.clearAllMocks();
});

describe("applyTranslationSyncPlan", () => {
	it("updates an existing translation file", async () => {
		mockedRead.mockResolvedValue(
			JSON.stringify({
				welcome: "مرحباً",
			}),
		);

		const result = await applyTranslationSyncPlan(
			createConfig(),
			createPlan(),
			false,
		);

		expect(result).toEqual({
			filesCreated: 0,
			filesUpdated: 1,
		});

		expect(mockedWrite).toHaveBeenCalledWith(
			"tests/app/i18n/ar-SA/common.json",
			'{\n  "welcome": "مرحباً",\n  "login": "Login"\n}\n',
		);
	});

	it("creates a missing translation file", async () => {
		const plan = createPlan(
			{
				targetPath: "tests/app/i18n/ar-SA/common.json",
				displayPath: "ar-SA/common.json",
				changes: [
					{
						key: "welcome",
						sourceValue: "Welcome",
					},
					{
						key: "login",
						sourceValue: "Login",
					},
				],
			},
			true,
		);

		const result = await applyTranslationSyncPlan(createConfig(), plan, false);

		expect(result).toEqual({
			filesCreated: 1,
			filesUpdated: 0,
		});

		expect(mockedWrite).toHaveBeenCalledWith(
			"tests/app/i18n/ar-SA/common.json",
			'{\n  "welcome": "Welcome",\n  "login": "Login"\n}\n',
		);
	});

	it("writes empty strings when empty mode is enabled", async () => {
		mockedRead.mockResolvedValue(
			JSON.stringify({
				welcome: "مرحباً",
			}),
		);

		const plan = createPlan({
			changes: [
				{
					key: "description",
					sourceValue: "Description",
				},
			],
		});

		await applyTranslationSyncPlan(createConfig(), plan, true);

		expect(mockedWrite).toHaveBeenCalledWith(
			"tests/app/i18n/ar-SA/common.json",
			'{\n  "welcome": "مرحباً",\n  "description": ""\n}\n',
		);
	});

	it("uses the configured JSON indentation", async () => {
		mockedRead.mockResolvedValue(
			JSON.stringify({
				welcome: "مرحباً",
			}),
		);

		const plan = createPlan({
			changes: [
				{
					key: "profile.title",
					sourceValue: "Profile",
				},
			],
		});

		await applyTranslationSyncPlan(
			createConfig({
				json: {
					indent: 4,
				},
			}),
			plan,
			false,
		);

		expect(mockedWrite).toHaveBeenCalledWith(
			"tests/app/i18n/ar-SA/common.json",
			'{\n    "welcome": "مرحباً",\n    "profile": {\n        "title": "Profile"\n    }\n}\n',
		);
	});

	it("preserves existing translations and applies only planned changes", async () => {
		mockedRead.mockResolvedValue(
			JSON.stringify({
				welcome: "مرحباً",
				login: "تسجيل الدخول",
			}),
		);

		const plan = createPlan({
			changes: [
				{
					key: "description",
					sourceValue: "Description",
				},
			],
		});

		await applyTranslationSyncPlan(createConfig(), plan, false);

		expect(mockedWrite).toHaveBeenCalledWith(
			"tests/app/i18n/ar-SA/common.json",
			'{\n  "welcome": "مرحباً",\n  "login": "تسجيل الدخول",\n  "description": "Description"\n}\n',
		);
	});

	it("rejects an existing translation file that is not a JSON object", async () => {
		mockedRead.mockResolvedValue(JSON.stringify(["Welcome"]));

		await expect(
			applyTranslationSyncPlan(createConfig(), createPlan(), false),
		).rejects.toThrow(
			"Translation file must contain a JSON object: tests/app/i18n/ar-SA/common.json",
		);

		expect(mockedWrite).not.toHaveBeenCalled();
	});
});
