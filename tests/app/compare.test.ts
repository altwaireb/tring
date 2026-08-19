import { describe, expect, it } from "vitest";

import { compareApplication, compareResource } from "@/app";
import { defineConfig, TranslationLayout } from "@/config";
import { formatTranslationComparison } from "@/translation";

describe("compare", () => {
	it("returns only resources from the source locale", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const result = await compareApplication(config);

		expect(result.source).toBe("en-US");

		expect(result.resources.map((resource) => resource.key)).toEqual([
			"admin/roles.json",
			"admin/users.json",
			"auth.json",
			"common.json",
			"dashboard/analytics/reports.json",
			"dashboard/overview.json",
			"notifications/email.json",
			"settings.json",
		]);
	});

	it("returns file layout resources from the source locale", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA"],
		});

		const result = await compareApplication(config);

		expect(result.source).toBe("en-US");

		expect(result.resources.map((resource) => resource.key)).toEqual([
			"en-US.json",
		]);
	});

	it("compares a source resource across locales", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const resources = await compareApplication(config);

		const resource = resources.resources.find(
			(resource) => resource.key === "admin/users.json",
		);

		expect(resource).toBeDefined();

		if (!resource) {
			throw new Error("Expected admin/users.json resource.");
		}

		const result = await compareResource(config, resource);

		expect(result.resource).toBe(resource);

		expect(result.comparisons).toEqual([
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
				key: "create",
				values: {
					"en-US": "Create user",
					"ar-SA": "إنشاء مستخدم",
					"fr-FR": "Créer un utilisateur",
					"de-DE": "Benutzer erstellen",
				},
			},
			{
				key: "edit",
				values: {
					"en-US": "Edit user",
					"ar-SA": "تعديل المستخدم",
					"fr-FR": "Modifier l'utilisateur",
					"de-DE": "Benutzer bearbeiten",
				},
			},
			{
				key: "delete",
				values: {
					"en-US": "Delete user",
					"ar-SA": "حذف المستخدم",
					"fr-FR": "Supprimer l'utilisateur",
					"de-DE": "Benutzer löschen",
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
			{
				key: "status.inactive",
				values: {
					"en-US": "Inactive",
					"ar-SA": "غير نشط",
					"fr-FR": undefined,
					"de-DE": undefined,
				},
			},
		]);
	});

	it("compares a file layout resource across locales", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA"],
		});

		const resources = await compareApplication(config);

		const resource = resources.resources[0];

		expect(resource).toBeDefined();

		if (!resource) {
			throw new Error("Expected source locale resource.");
		}

		const result = await compareResource(config, resource);

		expect(result.resource).toBe(resource);
		expect(result.comparisons.length).toBeGreaterThan(0);
	});

	it("formats a source resource comparison across locales", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/nested",
			layout: TranslationLayout.directories,
			source: "en-US",
			locales: ["ar-SA", "fr-FR", "de-DE"],
		});

		const resources = await compareApplication(config);

		const resource = resources.resources.find(
			(resource) => resource.key === "admin/users.json",
		);

		expect(resource).toBeDefined();

		if (!resource) {
			throw new Error("Expected admin/users.json resource.");
		}

		const result = await compareResource(config, resource);

		const output = formatTranslationComparison(result.comparisons, [
			config.source,
			...config.locales,
		]);

		expect(output).toBe(`key: title

en-US │ Users
ar-SA │ المستخدمون
fr-FR │ Utilisateurs
de-DE │ Benutzer

key: create

en-US │ Create user
ar-SA │ إنشاء مستخدم
fr-FR │ Créer un utilisateur
de-DE │ Benutzer erstellen

key: edit

en-US │ Edit user
ar-SA │ تعديل المستخدم
fr-FR │ Modifier l'utilisateur
de-DE │ Benutzer bearbeiten

key: delete

en-US │ Delete user
ar-SA │ حذف المستخدم
fr-FR │ Supprimer l'utilisateur
de-DE │ Benutzer löschen

key: status.active

en-US │ Active
ar-SA │ نشط
fr-FR │ (⚠ MISSING)
de-DE │ (⚠ MISSING)

key: status.inactive

en-US │ Inactive
ar-SA │ غير نشط
fr-FR │ (⚠ MISSING)
de-DE │ (⚠ MISSING)`);
	});
});
