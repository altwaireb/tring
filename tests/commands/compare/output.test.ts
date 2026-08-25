import { afterEach, describe, expect, it, vi } from "vitest";

import {
	printCompareHeader,
	printComparePagination,
	printTranslationComparisons,
} from "@/commands/compare/output";
import type { TranslationValueComparison } from "@/translation";

describe("compare output", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("prints the comparison header", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printCompareHeader("admin/users.json");

		expect(consoleLog.mock.calls).toEqual([
			["Translation Comparison"],
			[],
			["admin/users.json"],
			[],
		]);
	});

	it("prints translation values across locales", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const comparisons: TranslationValueComparison[] = [
			{
				key: "title",
				values: {
					"en-US": "Users",
					"ar-SA": "المستخدمون",
					"fr-FR": "Utilisateurs",
					"de-DE": "Benutzer",
				},
			},
		];

		printTranslationComparisons(comparisons, [
			"en-US",
			"ar-SA",
			"fr-FR",
			"de-DE",
		]);

		expect(consoleLog.mock.calls).toEqual([
			["key: title"],
			[],
			["  en-US  │  Users"],
			["  ar-SA  │  المستخدمون"],
			["  fr-FR  │  Utilisateurs"],
			["  de-DE  │  Benutzer"],
		]);
	});

	it("prints missing translation values", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const comparisons: TranslationValueComparison[] = [
			{
				key: "settings.title",
				values: {
					"en-US": "Settings",
					"ar-SA": "الإعدادات",
					"fr-FR": "Paramètres",
					"de-DE": undefined,
				},
			},
		];

		printTranslationComparisons(comparisons, [
			"en-US",
			"ar-SA",
			"fr-FR",
			"de-DE",
		]);

		expect(consoleLog.mock.calls).toEqual([
			["key: settings.title"],
			[],
			["  en-US  │  Settings"],
			["  ar-SA  │  الإعدادات"],
			["  fr-FR  │  Paramètres"],
			["  ⚠ de-DE  │  MISSING"],
		]);
	});

	it("preserves empty translation values", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const comparisons: TranslationValueComparison[] = [
			{
				key: "title",
				values: {
					"en-US": "",
					"ar-SA": undefined,
				},
			},
		];

		printTranslationComparisons(comparisons, ["en-US", "ar-SA"]);

		expect(consoleLog.mock.calls).toEqual([
			["key: title"],
			[],
			["  en-US  │  "],
			["  ⚠ ar-SA  │  MISSING"],
		]);
	});

	it("prints multiple translation keys", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		const comparisons: TranslationValueComparison[] = [
			{
				key: "title",
				values: {
					"en-US": "Settings",
					"ar-SA": "الإعدادات",
				},
			},
			{
				key: "description",
				values: {
					"en-US": "Manage settings",
					"ar-SA": "إدارة الإعدادات",
				},
			},
		];

		printTranslationComparisons(comparisons, ["en-US", "ar-SA"]);

		expect(consoleLog.mock.calls).toEqual([
			["key: title"],
			[],
			["  en-US  │  Settings"],
			["  ar-SA  │  الإعدادات"],
			[],
			[],
			["key: description"],
			[],
			["  en-US  │  Manage settings"],
			["  ar-SA  │  إدارة الإعدادات"],
		]);
	});

	it("prints pagination information", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		printComparePagination(10, 25);

		expect(consoleLog).toHaveBeenCalledWith("Showing 10 of 25 keys");
	});
});
