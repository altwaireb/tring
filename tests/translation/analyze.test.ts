import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
	analyzeTranslationDocuments,
	analyzeTranslations,
	type TranslationDocument,
} from "@/translation";

describe("analyzeTranslationDocuments", () => {
	it("returns no differences when documents have identical keys", () => {
		const source: TranslationDocument = {
			file: {
				locale: "en-US",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/en-US/common.json",
			},
			data: {
				welcome: "Welcome",
				auth: {
					login: "Login",
				},
			},
		};

		const target: TranslationDocument = {
			file: {
				locale: "ar-SA",
				directory: "",
				name: "common",
				filename: "common.json",
				key: "common.json",
				isLocaleFile: false,
				path: "/ar-SA/common.json",
			},
			data: {
				welcome: "مرحبًا",
				auth: {
					login: "تسجيل الدخول",
				},
			},
		};

		expect(analyzeTranslationDocuments(source, target)).toEqual({
			source: source.file,
			target: target.file,
			missingKeys: [],
			extraKeys: [],
		});
	});

	it("finds missing keys", () => {
		const source: TranslationDocument = {
			file: {
				locale: "en-US",
				directory: "",
				name: "auth",
				filename: "auth.json",
				key: "auth.json",
				isLocaleFile: false,
				path: "/en-US/auth.json",
			},
			data: {
				login: {
					title: "Login",
					button: "Sign in",
				},
				register: {
					title: "Register",
				},
			},
		};

		const target: TranslationDocument = {
			file: {
				locale: "ar-SA",
				directory: "",
				name: "auth",
				filename: "auth.json",
				key: "auth.json",
				isLocaleFile: false,
				path: "/ar-SA/auth.json",
			},
			data: {
				login: {
					title: "تسجيل الدخول",
				},
			},
		};

		expect(analyzeTranslationDocuments(source, target)).toEqual({
			source: source.file,
			target: target.file,
			missingKeys: ["login.button", "register.title"],
			extraKeys: [],
		});
	});

	it("finds extra keys", () => {
		const source: TranslationDocument = {
			file: {
				locale: "en-US",
				directory: "",
				name: "auth",
				filename: "auth.json",
				key: "auth.json",
				isLocaleFile: false,
				path: "/en-US/auth.json",
			},
			data: {
				login: {
					title: "Login",
				},
			},
		};

		const target: TranslationDocument = {
			file: {
				locale: "ar-SA",
				directory: "",
				name: "auth",
				filename: "auth.json",
				key: "auth.json",
				isLocaleFile: false,
				path: "/ar-SA/auth.json",
			},
			data: {
				login: {
					title: "تسجيل الدخول",
				},
				logout: {
					title: "تسجيل الخروج",
				},
			},
		};

		expect(analyzeTranslationDocuments(source, target)).toEqual({
			source: source.file,
			target: target.file,
			missingKeys: [],
			extraKeys: ["logout.title"],
		});
	});

	it("finds both missing and extra keys", () => {
		const source: TranslationDocument = {
			file: {
				locale: "en-US",
				directory: "",
				name: "auth",
				filename: "auth.json",
				key: "auth.json",
				isLocaleFile: false,
				path: "/en-US/auth.json",
			},
			data: {
				login: {
					title: "Login",
					button: "Sign in",
				},
			},
		};

		const target: TranslationDocument = {
			file: {
				locale: "ar-SA",
				directory: "",
				name: "auth",
				filename: "auth.json",
				key: "auth.json",
				isLocaleFile: false,
				path: "/ar-SA/auth.json",
			},
			data: {
				login: {
					title: "تسجيل الدخول",
				},
				logout: {
					title: "تسجيل الخروج",
				},
			},
		};

		expect(analyzeTranslationDocuments(source, target)).toEqual({
			source: source.file,
			target: target.file,
			missingKeys: ["login.button"],
			extraKeys: ["logout.title"],
		});
	});
});

describe("analyzeTranslations", () => {
	it("analyzes matched translation files", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const targetDirectory = join(directory, "ar-SA");

			await mkdir(sourceDirectory);
			await mkdir(targetDirectory);

			const sourcePath = join(sourceDirectory, "common.json");
			const targetPath = join(targetDirectory, "common.json");

			await writeFile(
				sourcePath,
				JSON.stringify({
					welcome: "Welcome",
					auth: {
						login: "Login",
					},
				}),
			);

			await writeFile(
				targetPath,
				JSON.stringify({
					welcome: "مرحبًا",
					auth: {
						login: "تسجيل الدخول",
					},
				}),
			);

			const sourceFiles = [
				{
					locale: "en-US",
					directory: "",
					name: "common",
					filename: "common.json",
					key: "common.json",
					isLocaleFile: false,
					path: sourcePath,
				},
			];

			const targetFiles = [
				{
					locale: "ar-SA",
					directory: "",
					name: "common",
					filename: "common.json",
					key: "common.json",
					isLocaleFile: false,
					path: targetPath,
				},
			];

			const result = await analyzeTranslations(
				"en-US",
				"ar-SA",
				sourceFiles,
				targetFiles,
			);

			expect(result).toEqual({
				sourceLocale: "en-US",
				targetLocale: "ar-SA",
				missingFiles: [],
				extraFiles: [],
				files: [
					{
						source: sourceFiles[0],
						target: targetFiles[0],
						missingKeys: [],
						extraKeys: [],
					},
				],
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("finds missing files", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const targetDirectory = join(directory, "ar-SA");

			await mkdir(sourceDirectory);
			await mkdir(targetDirectory);

			const commonPath = join(sourceDirectory, "common.json");
			const authPath = join(sourceDirectory, "auth.json");
			const targetCommonPath = join(targetDirectory, "common.json");

			await writeFile(
				commonPath,
				JSON.stringify({
					welcome: "Welcome",
				}),
			);

			await writeFile(
				authPath,
				JSON.stringify({
					login: "Login",
				}),
			);

			await writeFile(
				targetCommonPath,
				JSON.stringify({
					welcome: "مرحبًا",
				}),
			);

			const sourceFiles = [
				{
					locale: "en-US",
					directory: "",
					name: "common",
					filename: "common.json",
					key: "common.json",
					isLocaleFile: false,
					path: commonPath,
				},
				{
					locale: "en-US",
					directory: "",
					name: "auth",
					filename: "auth.json",
					key: "auth.json",
					isLocaleFile: false,
					path: authPath,
				},
			];

			const targetFiles = [
				{
					locale: "ar-SA",
					directory: "",
					name: "common",
					filename: "common.json",
					key: "common.json",
					isLocaleFile: false,
					path: targetCommonPath,
				},
			];

			const result = await analyzeTranslations(
				"en-US",
				"ar-SA",
				sourceFiles,
				targetFiles,
			);

			expect(result.missingFiles).toEqual([sourceFiles[1]]);

			expect(result.extraFiles).toEqual([]);

			expect(result.files).toEqual([
				{
					source: sourceFiles[0],
					target: targetFiles[0],
					missingKeys: [],
					extraKeys: [],
				},
			]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("finds extra files without reading them", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const targetDirectory = join(directory, "ar-SA");

			await mkdir(sourceDirectory);
			await mkdir(targetDirectory);

			const sourcePath = join(sourceDirectory, "common.json");
			const targetPath = join(targetDirectory, "common.json");
			const extraPath = join(targetDirectory, "legacy.json");

			await writeFile(
				sourcePath,
				JSON.stringify({
					welcome: "Welcome",
				}),
			);

			await writeFile(
				targetPath,
				JSON.stringify({
					welcome: "مرحبًا",
				}),
			);

			const sourceFiles = [
				{
					locale: "en-US",
					directory: "",
					name: "common",
					filename: "common.json",
					key: "common.json",
					isLocaleFile: false,
					path: sourcePath,
				},
			];

			const targetFiles = [
				{
					locale: "ar-SA",
					directory: "",
					name: "common",
					filename: "common.json",
					key: "common.json",
					isLocaleFile: false,
					path: targetPath,
				},
				{
					locale: "ar-SA",
					directory: "",
					name: "legacy",
					filename: "legacy.json",
					key: "legacy.json",
					isLocaleFile: false,
					path: extraPath,
				},
			];

			const result = await analyzeTranslations(
				"en-US",
				"ar-SA",
				sourceFiles,
				targetFiles,
			);

			expect(result.missingFiles).toEqual([]);

			expect(result.extraFiles).toEqual([targetFiles[1]]);

			expect(result.files).toEqual([
				{
					source: sourceFiles[0],
					target: targetFiles[0],
					missingKeys: [],
					extraKeys: [],
				},
			]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("finds missing and extra keys in matched files", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const targetDirectory = join(directory, "ar-SA");

			await mkdir(sourceDirectory);
			await mkdir(targetDirectory);

			const sourcePath = join(sourceDirectory, "auth.json");
			const targetPath = join(targetDirectory, "auth.json");

			await writeFile(
				sourcePath,
				JSON.stringify({
					login: {
						title: "Login",
						button: "Sign in",
					},
				}),
			);

			await writeFile(
				targetPath,
				JSON.stringify({
					login: {
						title: "تسجيل الدخول",
					},
					logout: {
						title: "تسجيل الخروج",
					},
				}),
			);

			const sourceFiles = [
				{
					locale: "en-US",
					directory: "",
					name: "auth",
					filename: "auth.json",
					key: "auth.json",
					isLocaleFile: false,
					path: sourcePath,
				},
			];

			const targetFiles = [
				{
					locale: "ar-SA",
					directory: "",
					name: "auth",
					filename: "auth.json",
					key: "auth.json",
					isLocaleFile: false,
					path: targetPath,
				},
			];

			const result = await analyzeTranslations(
				"en-US",
				"ar-SA",
				sourceFiles,
				targetFiles,
			);

			expect(result).toEqual({
				sourceLocale: "en-US",
				targetLocale: "ar-SA",
				missingFiles: [],
				extraFiles: [],
				files: [
					{
						source: sourceFiles[0],
						target: targetFiles[0],
						missingKeys: ["login.button"],
						extraKeys: ["logout.title"],
					},
				],
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("distinguishes files with the same name in different directories", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const targetDirectory = join(directory, "ar-SA");

			const sourceAdminDirectory = join(sourceDirectory, "admin");
			const sourceUserDirectory = join(sourceDirectory, "user");
			const targetAdminDirectory = join(targetDirectory, "admin");

			await mkdir(sourceAdminDirectory, { recursive: true });
			await mkdir(sourceUserDirectory, { recursive: true });
			await mkdir(targetAdminDirectory, { recursive: true });

			const sourceAdminPath = join(sourceAdminDirectory, "common.json");
			const sourceUserPath = join(sourceUserDirectory, "common.json");
			const targetAdminPath = join(targetAdminDirectory, "common.json");

			await writeFile(
				sourceAdminPath,
				JSON.stringify({
					welcome: "Admin",
				}),
			);

			await writeFile(
				sourceUserPath,
				JSON.stringify({
					welcome: "User",
				}),
			);

			await writeFile(
				targetAdminPath,
				JSON.stringify({
					welcome: "مدير",
				}),
			);

			const sourceFiles = [
				{
					locale: "en-US",
					directory: "admin",
					name: "common",
					filename: "common.json",
					key: "admin/common.json",
					isLocaleFile: false,
					path: sourceAdminPath,
				},
				{
					locale: "en-US",
					directory: "user",
					name: "common",
					filename: "common.json",
					key: "user/common.json",
					isLocaleFile: false,
					path: sourceUserPath,
				},
			];

			const targetFiles = [
				{
					locale: "ar-SA",
					directory: "admin",
					name: "common",
					filename: "common.json",
					key: "admin/common.json",
					isLocaleFile: false,
					path: targetAdminPath,
				},
			];

			const result = await analyzeTranslations(
				"en-US",
				"ar-SA",
				sourceFiles,
				targetFiles,
			);

			expect(result.missingFiles).toEqual([sourceFiles[1]]);

			expect(result.extraFiles).toEqual([]);

			expect(result.files).toEqual([
				{
					source: sourceFiles[0],
					target: targetFiles[0],
					missingKeys: [],
					extraKeys: [],
				},
			]);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});
});

async function createTempDirectory(): Promise<string> {
	const directory = join(
		tmpdir(),
		`tring-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);

	await mkdir(directory, {
		recursive: true,
	});

	return directory;
}
