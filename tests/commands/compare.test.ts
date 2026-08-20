import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	compareApplication: vi.fn(),
	compareResource: vi.fn(),
	findTranslationKeyResources: vi.fn(),
	paginationPrompt: vi.fn(),
	search: vi.fn(),
}));

vi.mock("@/app", () => ({
	compareApplication: mocks.compareApplication,
	compareResource: mocks.compareResource,
	findTranslationKeyResources: mocks.findTranslationKeyResources,
}));

vi.mock("@/prompt", () => ({
	paginationPrompt: mocks.paginationPrompt,
	search: mocks.search,
}));

import { runCompareCommand } from "@/cli/commands/compare";
import { defineConfig, TranslationLayout } from "@/config";
import type { TranslationFile } from "@/translation";

const config = defineConfig({
	directory: "tests/app/i18n/nested",
	layout: TranslationLayout.directories,
	source: "en-US",
	locales: ["ar-SA", "fr-FR", "de-DE"],
});
// test for directories layout
describe("compare command", () => {
	let logs: string[];

	beforeEach(() => {
		vi.clearAllMocks();

		logs = [];

		mocks.compareApplication.mockResolvedValue({
			source: "en-US",
			resources: [createResource("admin/users.json")],
		});

		vi.spyOn(console, "log").mockImplementation((...args) => {
			logs.push(args.join(" "));
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("searches source resources", async () => {
		const selectedResource = createResource("admin/users.json");

		mocks.search.mockResolvedValue(selectedResource);

		mocks.compareResource.mockResolvedValue({
			resource: selectedResource,
			comparisons: createComparisons(6),
		});

		const result = await runCompareCommand(config);

		expect(result.exitCode).toBe(0);
		expect(result.resource).toBe(selectedResource);

		expect(mocks.search).toHaveBeenCalledTimes(1);

		const options = mocks.search.mock.calls[0]?.[0];

		expect(options).toBeDefined();

		if (!options) {
			throw new Error("Expected search options.");
		}

		expect(options.message).toBe("Select a resource:");
		expect(options.pageSize).toBe(8);
	});

	it("filters resources by search term", async () => {
		const selectedResource = createResource("admin/users.json");

		mocks.search.mockResolvedValue(selectedResource);

		mocks.compareResource.mockResolvedValue({
			resource: selectedResource,
			comparisons: createComparisons(6),
		});

		await runCompareCommand(config);

		const options = mocks.search.mock.calls[0]?.[0];

		expect(options).toBeDefined();

		if (!options) {
			throw new Error("Expected search options.");
		}

		const choices = await options.source("admin/us", {
			signal: new AbortController().signal,
		});

		expect(choices).toEqual([
			{
				name: "admin/users.json",
				value: expect.objectContaining({
					key: "admin/users.json",
				}),
			},
		]);
	});

	it("paginates comparison results", async () => {
		const selectedResource = createResource("admin/users.json");

		mocks.search.mockResolvedValue(selectedResource);

		mocks.compareResource.mockResolvedValue({
			resource: selectedResource,
			comparisons: createComparisons(17),
		});

		mocks.paginationPrompt
			.mockResolvedValueOnce("continue")
			.mockResolvedValueOnce("continue");

		const result = await runCompareCommand(config);

		expect(result.exitCode).toBe(0);
		expect(result.resource).toBe(selectedResource);

		expect(mocks.paginationPrompt).toHaveBeenCalledTimes(2);

		expect(logs).toContain("Showing 8 of 17 keys");
		expect(logs).toContain("Showing 16 of 17 keys");
		expect(logs).toContain("Showing 17 of 17 keys");
	});

	it("stops pagination when quit is selected", async () => {
		const selectedResource = createResource("admin/users.json");

		mocks.search.mockResolvedValue(selectedResource);

		mocks.compareResource.mockResolvedValue({
			resource: selectedResource,
			comparisons: createComparisons(17),
		});

		mocks.paginationPrompt.mockResolvedValue("quit");

		const result = await runCompareCommand(config);

		expect(result.exitCode).toBe(0);
		expect(result.resource).toBe(selectedResource);

		expect(mocks.paginationPrompt).toHaveBeenCalledTimes(1);

		expect(logs).toContain("Showing 8 of 17 keys");
		expect(logs).not.toContain("Showing 16 of 17 keys");
		expect(logs).not.toContain("Showing 17 of 17 keys");
	});

	it("selects a source resource directly when file is provided", async () => {
		const resource = createResource("admin/users.json");

		mocks.compareResource.mockResolvedValue({
			resource,
			comparisons: createComparisons(6),
		});

		const result = await runCompareCommand(config, {
			file: "admin/users.json",
		});

		expect(result.exitCode).toBe(0);
		expect(result.resource).toEqual(resource);

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).toHaveBeenCalledWith(config, resource);
	});

	it("throws when the requested file does not exist", async () => {
		await expect(
			runCompareCommand(config, {
				file: "admin/missing.json",
			}),
		).rejects.toThrow(
			'Translation resource was not found: "admin/missing.json".',
		);

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).not.toHaveBeenCalled();
	});

	it("filters comparison results by key", async () => {
		const selectedResource = createResource("admin/users.json");

		mocks.findTranslationKeyResources.mockResolvedValue([selectedResource]);
		mocks.search.mockResolvedValue(selectedResource);

		mocks.compareResource.mockResolvedValue({
			resource: selectedResource,
			comparisons: [
				{
					key: "title",
					values: {
						"en-US": "Users",
						"ar-SA": "المستخدمون",
						"fr-FR": "Utilisateurs",
						"de-DE": "Benutzer",
					},
				},
				{
					key: "status.active",
					values: {
						"en-US": "Active",
						"ar-SA": "نشط",
						"fr-FR": undefined,
						"de-DE": undefined,
					},
				},
			],
		});

		const result = await runCompareCommand(config, {
			key: "status.active",
		});

		expect(result.exitCode).toBe(0);
		expect(result.resource).toBe(selectedResource);

		expect(mocks.findTranslationKeyResources).toHaveBeenCalledWith(
			config,
			"status.active",
		);

		const output = logs.join("\n");

		expect(output).toContain("key: status.active");
		expect(output).not.toContain("key: title");
	});

	it("throws when the requested key does not exist", async () => {
		const selectedResource = createResource("admin/users.json");

		mocks.findTranslationKeyResources.mockResolvedValue([selectedResource]);
		mocks.search.mockResolvedValue(selectedResource);

		mocks.compareResource.mockResolvedValue({
			resource: selectedResource,
			comparisons: createComparisons(6),
		});

		await expect(
			runCompareCommand(config, {
				key: "does.not.exist",
			}),
		).rejects.toThrow('Translation key was not found: "does.not.exist".');

		expect(mocks.findTranslationKeyResources).toHaveBeenCalledWith(
			config,
			"does.not.exist",
		);
	});

	it("selects a file and filters by key", async () => {
		const resource = createResource("admin/users.json");

		mocks.compareResource.mockResolvedValue({
			resource,
			comparisons: [
				{
					key: "title",
					values: {
						"en-US": "Users",
						"ar-SA": "المستخدمون",
						"fr-FR": "Utilisateurs",
						"de-DE": "Benutzer",
					},
				},
				{
					key: "status.active",
					values: {
						"en-US": "Active",
						"ar-SA": "نشط",
						"fr-FR": undefined,
						"de-DE": undefined,
					},
				},
			],
		});

		const result = await runCompareCommand(config, {
			file: "admin/users.json",
			key: "status.active",
		});

		expect(result.exitCode).toBe(0);
		expect(result.resource).toEqual(resource);

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).toHaveBeenCalledWith(config, resource);

		const output = logs.join("\n");

		expect(output).toContain("key: status.active");
		expect(output).not.toContain("key: title");
	});

	it("selects the resource automatically when key exists in one file", async () => {
		const resource = createResource("admin/users.json");

		mocks.compareApplication.mockResolvedValue({
			source: "en-US",
			resources: [resource],
		});

		mocks.findTranslationKeyResources.mockResolvedValue([resource]);

		mocks.compareResource.mockResolvedValue({
			resource,
			comparisons: [
				{
					key: "status.active",
					values: {
						"en-US": "Active",
						"ar-SA": "نشط",
						"fr-FR": undefined,
						"de-DE": undefined,
					},
				},
			],
		});

		const result = await runCompareCommand(config, {
			key: "status.active",
		});

		expect(result.exitCode).toBe(0);
		expect(result.resource).toEqual(resource);

		expect(mocks.findTranslationKeyResources).toHaveBeenCalledWith(
			config,
			"status.active",
		);

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).toHaveBeenCalledWith(config, resource);
	});

	it("prompts for a resource when key exists in multiple files", async () => {
		const usersResource = createResource("admin/users.json");
		const settingsResource = createResource("settings.json");

		mocks.compareApplication.mockResolvedValue({
			source: "en-US",
			resources: [usersResource, settingsResource],
		});

		mocks.findTranslationKeyResources.mockResolvedValue([
			usersResource,
			settingsResource,
		]);

		mocks.search.mockResolvedValue(usersResource);

		mocks.compareResource.mockResolvedValue({
			resource: usersResource,
			comparisons: [
				{
					key: "status.active",
					values: {
						"en-US": "Active",
						"ar-SA": "نشط",
						"fr-FR": undefined,
						"de-DE": undefined,
					},
				},
			],
		});

		const result = await runCompareCommand(config, {
			key: "status.active",
		});

		expect(result.exitCode).toBe(0);
		expect(result.resource).toEqual(usersResource);

		expect(mocks.findTranslationKeyResources).toHaveBeenCalledWith(
			config,
			"status.active",
		);

		expect(mocks.search).toHaveBeenCalledTimes(1);

		const options = mocks.search.mock.calls[0]?.[0];

		expect(options).toBeDefined();

		if (!options) {
			throw new Error("Expected search options.");
		}

		const choices = await options.source("", {
			signal: new AbortController().signal,
		});

		expect(choices).toEqual([
			{
				name: "admin/users.json",
				value: usersResource,
			},
			{
				name: "settings.json",
				value: settingsResource,
			},
		]);
	});

	it("throws when the key does not exist in source resources", async () => {
		mocks.compareApplication.mockResolvedValue({
			source: "en-US",
			resources: [createResource("admin/users.json")],
		});

		mocks.findTranslationKeyResources.mockResolvedValue([]);

		await expect(
			runCompareCommand(config, {
				key: "does.not.exist",
			}),
		).rejects.toThrow(
			'Translation key was not found in source resources: "does.not.exist".',
		);

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).not.toHaveBeenCalled();
	});
});

// test for files layout
describe("compare command (files layout)", () => {
	const config = defineConfig({
		directory: "tests/app/i18n/files",
		layout: TranslationLayout.files,
		source: "en-US",
		locales: ["ar-SA"],
	});

	let logs: string[];

	beforeEach(() => {
		vi.clearAllMocks();

		logs = [];

		const resource = createFileResource();

		mocks.compareApplication.mockResolvedValue({
			source: "en-US",
			resources: [resource],
		});

		vi.spyOn(console, "log").mockImplementation((...args) => {
			logs.push(args.join(" "));
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("searches source locale file", async () => {
		const resource = createFileResource();

		mocks.search.mockResolvedValue(resource);

		mocks.compareResource.mockResolvedValue({
			resource,
			comparisons: [
				{
					key: "auth.title",
					values: {
						"en-US": "Authentication",
						"ar-SA": "المصادقة",
					},
				},
				{
					key: "auth.login",
					values: {
						"en-US": "Login",
						"ar-SA": "تسجيل الدخول",
					},
				},
			],
		});

		const result = await runCompareCommand(config);

		expect(result.exitCode).toBe(0);
		expect(result.resource).toEqual(resource);

		expect(mocks.search).toHaveBeenCalledTimes(1);

		const options = mocks.search.mock.calls[0]?.[0];

		expect(options).toBeDefined();

		if (!options) {
			throw new Error("Expected search options.");
		}

		expect(options.message).toBe("Select a resource:");
		expect(options.pageSize).toBe(8);

		const choices = await options.source("", {
			signal: new AbortController().signal,
		});

		expect(choices).toEqual([
			{
				name: "en-US.json",
				value: resource,
			},
		]);
	});

	it("selects the source locale file directly when file is provided", async () => {
		const resource = createFileResource();

		mocks.compareResource.mockResolvedValue({
			resource,
			comparisons: [
				{
					key: "auth.title",
					values: {
						"en-US": "Authentication",
						"ar-SA": "المصادقة",
					},
				},
			],
		});

		const result = await runCompareCommand(config, {
			file: "en-US.json",
		});

		expect(result.exitCode).toBe(0);
		expect(result.resource).toEqual(resource);

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).toHaveBeenCalledWith(config, resource);

		expect(logs.join("\n")).toContain("auth.title");
	});

	it("filters the file comparison by key", async () => {
		const resource = createFileResource();

		mocks.findTranslationKeyResources.mockResolvedValue([resource]);

		mocks.compareResource.mockResolvedValue({
			resource,
			comparisons: [
				{
					key: "auth.title",
					values: {
						"en-US": "Authentication",
						"ar-SA": "المصادقة",
					},
				},
				{
					key: "common.save",
					values: {
						"en-US": "Save",
						"ar-SA": "حفظ",
					},
				},
			],
		});

		const result = await runCompareCommand(config, {
			key: "common.save",
		});

		expect(result.exitCode).toBe(0);
		expect(result.resource).toEqual(resource);

		expect(mocks.findTranslationKeyResources).toHaveBeenCalledWith(
			config,
			"common.save",
		);

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).toHaveBeenCalledWith(config, resource);

		const output = logs.join("\n");

		expect(output).toContain("key: common.save");
		expect(output).not.toContain("key: auth.title");
	});

	it("selects the file automatically when key exists in the source locale file", async () => {
		const resource = createFileResource();

		mocks.findTranslationKeyResources.mockResolvedValue([resource]);

		mocks.compareResource.mockResolvedValue({
			resource,
			comparisons: [
				{
					key: "auth.title",
					values: {
						"en-US": "Authentication",
						"ar-SA": "المصادقة",
					},
				},
			],
		});

		const result = await runCompareCommand(config, {
			key: "auth.title",
		});

		expect(result.exitCode).toBe(0);
		expect(result.resource).toEqual(resource);

		expect(mocks.findTranslationKeyResources).toHaveBeenCalledWith(
			config,
			"auth.title",
		);

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).toHaveBeenCalledWith(config, resource);
	});

	it("throws when the requested file does not exist", async () => {
		await expect(
			runCompareCommand(config, {
				file: "missing.json",
			}),
		).rejects.toThrow('Translation resource was not found: "missing.json".');

		expect(mocks.search).not.toHaveBeenCalled();
		expect(mocks.compareResource).not.toHaveBeenCalled();
	});
});

function createFileResource(): TranslationFile {
	return {
		locale: "en-US",
		directory: "",
		name: "locale",
		filename: "en-US.json",
		key: "en-US.json",
		isLocaleFile: true,
		path: "tests/app/i18n/files/en-US.json",
	};
}

function createComparisons(count: number) {
	return Array.from({ length: count }, (_, index) => ({
		key: `key${index + 1}`,
		values: {
			"en-US": `Value ${index + 1}`,
			"ar-SA": `قيمة ${index + 1}`,
			"fr-FR": `Valeur ${index + 1}`,
			"de-DE": `Wert ${index + 1}`,
		},
	}));
}

function createResource(key: string): TranslationFile {
	return {
		locale: "en-US",
		directory: key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "",
		name:
			key
				.split("/")
				.pop()
				?.replace(/\.json$/, "") ?? "",
		filename: key.split("/").pop() ?? key,
		key,
		isLocaleFile: false,
		path: `tests/app/i18n/nested/en-US/${key}`,
	};
}
