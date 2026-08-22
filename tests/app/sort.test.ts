import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { sortApplication } from "@/app";
import { defineConfig, TranslationLayout } from "@/config";
import {
	InvalidTranslationFilePathError,
	TranslationFileNotFoundError,
} from "@/exceptions";

describe("sortApplication", () => {
	it("sorts unsorted translation files in directories layout", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const settingsPath = join(sourceDirectory, "settings.json");

			await mkdir(sourceDirectory, { recursive: true });

			await writeFile(
				settingsPath,
				JSON.stringify({
					title: "Settings",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
			});

			const result = await sortApplication(config);

			expect(result.results).toEqual([
				expect.objectContaining({
					isModified: true,
				}),
			]);

			const content = await readFile(settingsPath, "utf8");

			expect(JSON.parse(content)).toEqual({
				account: {
					email: "Email",
					title: "Account",
				},
				title: "Settings",
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("does not modify an already sorted translation file", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const settingsPath = join(sourceDirectory, "settings.json");

			await mkdir(sourceDirectory, { recursive: true });

			await writeFile(
				settingsPath,
				JSON.stringify({
					account: {
						email: "Email",
						title: "Account",
					},
					title: "Settings",
				}),
			);

			const originalContent = await readFile(settingsPath, "utf8");

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
			});

			const result = await sortApplication(config);

			expect(result.results).toEqual([
				expect.objectContaining({
					isModified: false,
				}),
			]);

			const content = await readFile(settingsPath, "utf8");

			expect(content).toBe(originalContent);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("sorts nested objects recursively", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const settingsPath = join(sourceDirectory, "settings.json");

			await mkdir(sourceDirectory, { recursive: true });

			await writeFile(
				settingsPath,
				JSON.stringify({
					title: "Settings",
					security: {
						title: "Security",
						password: "Password",
					},
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
			});

			await sortApplication(config);

			const content = await readFile(settingsPath, "utf8");

			expect(JSON.parse(content)).toEqual({
				account: {
					email: "Email",
					title: "Account",
				},
				security: {
					password: "Password",
					title: "Security",
				},
				title: "Settings",
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("returns the modification status for each translation file", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const settingsPath = join(sourceDirectory, "settings.json");
			const usersDirectory = join(sourceDirectory, "admin");
			const usersPath = join(usersDirectory, "users.json");

			await mkdir(usersDirectory, { recursive: true });

			await writeFile(
				settingsPath,
				JSON.stringify({
					account: {
						email: "Email",
						title: "Account",
					},
					title: "Settings",
				}),
			);

			await writeFile(
				usersPath,
				JSON.stringify({
					title: "Users",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
			});

			const result = await sortApplication(config);

			expect(result.results).toHaveLength(2);

			const settingsResult = result.results.find(
				(item) => item.file.key === "settings.json",
			);

			const usersResult = result.results.find(
				(item) => item.file.key === "admin/users.json",
			);

			expect(settingsResult).toEqual(
				expect.objectContaining({
					isModified: false,
				}),
			);

			expect(usersResult).toEqual(
				expect.objectContaining({
					isModified: true,
				}),
			);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("sorts translation files for a specific locale", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const targetDirectory = join(directory, "ar-SA");

			await mkdir(sourceDirectory, { recursive: true });
			await mkdir(targetDirectory, { recursive: true });

			const sourcePath = join(sourceDirectory, "settings.json");
			const targetPath = join(targetDirectory, "settings.json");

			await writeFile(
				sourcePath,
				JSON.stringify({
					title: "Settings",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			await writeFile(
				targetPath,
				JSON.stringify({
					title: "الإعدادات",
					account: {
						title: "الحساب",
						email: "البريد",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: ["ar-SA"],
			});

			const result = await sortApplication(config, {
				locale: "ar-SA",
			});

			expect(result.results).toHaveLength(1);
			expect(result.results[0]?.file.locale).toBe("ar-SA");
			expect(result.results[0]?.isModified).toBe(true);

			const sourceContent = await readFile(sourcePath, "utf8");
			const targetContent = await readFile(targetPath, "utf8");

			expect(JSON.parse(sourceContent)).toEqual({
				title: "Settings",
				account: {
					title: "Account",
					email: "Email",
				},
			});

			expect(JSON.parse(targetContent)).toEqual({
				account: {
					email: "البريد",
					title: "الحساب",
				},
				title: "الإعدادات",
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("sorts only the specified translation file", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const arDirectory = join(directory, "ar-SA");
			const frDirectory = join(directory, "fr-FR");

			await mkdir(sourceDirectory, { recursive: true });
			await mkdir(join(arDirectory, "admin"), { recursive: true });
			await mkdir(join(frDirectory, "admin"), { recursive: true });

			const sourcePath = join(sourceDirectory, "settings.json");
			const arPath = join(arDirectory, "admin", "roles.json");
			const frPath = join(frDirectory, "admin", "roles.json");

			await writeFile(
				sourcePath,
				JSON.stringify({
					title: "Settings",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			await writeFile(
				arPath,
				JSON.stringify({
					title: "Roles",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			await writeFile(
				frPath,
				JSON.stringify({
					title: "Roles",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: ["ar-SA", "fr-FR"],
			});

			const result = await sortApplication(config, {
				file: "ar-SA/admin/roles.json",
			});

			expect(result.results).toHaveLength(1);
			expect(result.results[0]?.file.locale).toBe("ar-SA");
			expect(result.results[0]?.file.key).toBe("admin/roles.json");
			expect(result.results[0]?.isModified).toBe(true);

			expect(JSON.parse(await readFile(arPath, "utf8"))).toEqual({
				account: {
					email: "Email",
					title: "Account",
				},
				title: "Roles",
			});

			expect(JSON.parse(await readFile(frPath, "utf8"))).toEqual({
				title: "Roles",
				account: {
					title: "Account",
					email: "Email",
				},
			});

			expect(JSON.parse(await readFile(sourcePath, "utf8"))).toEqual({
				title: "Settings",
				account: {
					title: "Account",
					email: "Email",
				},
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("supports files layout", async () => {
		const directory = await createTempDirectory();

		try {
			const settingsPath = join(directory, "en-US.json");

			await writeFile(
				settingsPath,
				JSON.stringify({
					title: "Settings",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.files,
				source: "en-US",
				locales: [],
			});

			const result = await sortApplication(config);

			expect(result.results).toEqual([
				expect.objectContaining({
					isModified: true,
					file: expect.objectContaining({
						key: "en-US.json",
					}),
				}),
			]);

			const content = await readFile(settingsPath, "utf8");

			expect(JSON.parse(content)).toEqual({
				account: {
					email: "Email",
					title: "Account",
				},
				title: "Settings",
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("sorts a specific locale in files layout", async () => {
		const directory = await createTempDirectory();

		try {
			const sourcePath = join(directory, "en-US.json");
			const targetPath = join(directory, "ar-SA.json");

			await writeFile(
				sourcePath,
				JSON.stringify({
					title: "Settings",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			await writeFile(
				targetPath,
				JSON.stringify({
					title: "الإعدادات",
					account: {
						title: "الحساب",
						email: "البريد",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.files,
				source: "en-US",
				locales: ["ar-SA"],
			});

			const result = await sortApplication(config, {
				locale: "ar-SA",
			});

			expect(result.results).toHaveLength(1);
			expect(result.results[0]?.file.locale).toBe("ar-SA");
			expect(result.results[0]?.file.key).toBe("ar-SA.json");
			expect(result.results[0]?.isModified).toBe(true);

			expect(JSON.parse(await readFile(sourcePath, "utf8"))).toEqual({
				title: "Settings",
				account: {
					title: "Account",
					email: "Email",
				},
			});

			expect(JSON.parse(await readFile(targetPath, "utf8"))).toEqual({
				account: {
					email: "البريد",
					title: "الحساب",
				},
				title: "الإعدادات",
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("sorts a specific file in files layout", async () => {
		const directory = await createTempDirectory();

		try {
			const sourcePath = join(directory, "en-US.json");
			const targetPath = join(directory, "ar-SA.json");

			await writeFile(
				sourcePath,
				JSON.stringify({
					title: "Settings",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			await writeFile(
				targetPath,
				JSON.stringify({
					title: "الإعدادات",
					account: {
						title: "الحساب",
						email: "البريد",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.files,
				source: "en-US",
				locales: ["ar-SA"],
			});

			const result = await sortApplication(config, {
				file: "ar-SA.json",
			});

			expect(result.results).toHaveLength(1);
			expect(result.results[0]?.file.locale).toBe("ar-SA");
			expect(result.results[0]?.file.key).toBe("ar-SA.json");
			expect(result.results[0]?.isModified).toBe(true);

			expect(JSON.parse(await readFile(sourcePath, "utf8"))).toEqual({
				title: "Settings",
				account: {
					title: "Account",
					email: "Email",
				},
			});

			expect(JSON.parse(await readFile(targetPath, "utf8"))).toEqual({
				account: {
					email: "البريد",
					title: "الحساب",
				},
				title: "الإعدادات",
			});
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("rejects a file path without a locale in directories layout", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");

			await mkdir(join(sourceDirectory, "admin"), {
				recursive: true,
			});

			await writeFile(
				join(sourceDirectory, "admin", "roles.json"),
				JSON.stringify({
					title: "Roles",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
			});

			await expect(
				sortApplication(config, {
					file: "admin/roles.json",
				}),
			).rejects.toBeInstanceOf(InvalidTranslationFilePathError);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("rejects a directory-style file path in files layout", async () => {
		const directory = await createTempDirectory();

		try {
			const targetPath = join(directory, "ar-SA.json");

			await writeFile(
				targetPath,
				JSON.stringify({
					title: "الإعدادات",
					account: {
						title: "الحساب",
						email: "البريد",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.files,
				source: "en-US",
				locales: ["ar-SA"],
			});

			await expect(
				sortApplication(config, {
					file: "ar-SA/admin/roles.json",
				}),
			).rejects.toBeInstanceOf(InvalidTranslationFilePathError);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("uses the configured JSON indentation", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const settingsPath = join(sourceDirectory, "settings.json");

			await mkdir(sourceDirectory, { recursive: true });

			await writeFile(
				settingsPath,
				JSON.stringify({
					title: "Settings",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
				json: {
					indent: 4,
				},
			});

			await sortApplication(config);

			const content = await readFile(settingsPath, "utf8");

			expect(content).toBe(`{
    "account": {
        "email": "Email",
        "title": "Account"
    },
    "title": "Settings"
}
`);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("uses the default JSON indentation", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");
			const settingsPath = join(sourceDirectory, "settings.json");

			await mkdir(sourceDirectory, { recursive: true });

			await writeFile(
				settingsPath,
				JSON.stringify({
					title: "Settings",
					account: {
						title: "Account",
						email: "Email",
					},
				}),
			);

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
			});

			await sortApplication(config);

			const content = await readFile(settingsPath, "utf8");

			expect(content).toBe(`{
  "account": {
    "email": "Email",
    "title": "Account"
  },
  "title": "Settings"
}
`);
		} finally {
			await rm(directory, {
				recursive: true,
				force: true,
			});
		}
	});

	it("throws when the specified translation file does not exist", async () => {
		const directory = await createTempDirectory();

		try {
			const sourceDirectory = join(directory, "en-US");

			await mkdir(sourceDirectory, { recursive: true });

			const config = defineConfig({
				directory,
				layout: TranslationLayout.directories,
				source: "en-US",
				locales: [],
			});

			await expect(
				sortApplication(config, {
					file: "en-US/admin/missing.json",
				}),
			).rejects.toBeInstanceOf(TranslationFileNotFoundError);
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
