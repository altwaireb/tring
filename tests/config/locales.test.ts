import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const loadTringConfig = vi.hoisted(() => vi.fn());

vi.mock("@/config/loader", () => ({
	loadTringConfig,
}));

import { addLocaleToConfig, hasLocaleInConfig } from "@/config/locales";

const testDirectory = join(process.cwd(), "tests", ".tmp-config");
const configPath = join(testDirectory, "tring.config.ts");

async function writeConfig(content: string): Promise<void> {
	await mkdir(testDirectory, { recursive: true });
	await writeFile(configPath, content, "utf8");

	loadTringConfig.mockResolvedValue({
		_configFile: configPath,
	});
}

afterEach(async () => {
	await rm(testDirectory, { recursive: true, force: true });
	vi.clearAllMocks();
});

describe("hasLocaleInConfig", () => {
	it("returns true when the locale exists", async () => {
		await writeConfig(`import { defineConfig } from "tring";

export default defineConfig({
	locales: ["ar-SA", "fr-FR", "de-DE"],
});
`);

		await expect(hasLocaleInConfig("de-DE")).resolves.toBe(true);
	});

	it("returns false when the locale does not exist", async () => {
		await writeConfig(`import { defineConfig } from "tring";

export default defineConfig({
	locales: ["ar-SA", "fr-FR", "de-DE"],
});
`);

		await expect(hasLocaleInConfig("zh-CN")).resolves.toBe(false);
	});
});

describe("addLocaleToConfig", () => {
	it("adds a missing locale", async () => {
		await writeConfig(`import { defineConfig } from "tring";

export default defineConfig({
	locales: ["ar-SA", "fr-FR", "de-DE"],
});
`);

		await addLocaleToConfig("zh-CN");

		const { readFile } = await import("node:fs/promises");
		const content = await readFile(configPath, "utf8");

		expect(content).toContain('locales: ["ar-SA", "fr-FR", "de-DE", "zh-CN"]');
	});

	it("does not duplicate an existing locale", async () => {
		await writeConfig(`import { defineConfig } from "tring";

export default defineConfig({
	locales: ["ar-SA", "fr-FR", "de-DE"],
});
`);

		await addLocaleToConfig("de-DE");

		const { readFile } = await import("node:fs/promises");
		const content = await readFile(configPath, "utf8");

		expect(content).toContain('locales: ["ar-SA", "fr-FR", "de-DE"]');
		expect(content).not.toContain('de-DE", "de-DE');
	});

	it("preserves comments and other configuration", async () => {
		await writeConfig(`import { defineConfig } from "tring";

// Project translation configuration.
export default defineConfig({
	directory: "app/i18n",

	layout: "directories",

	source: "en-US",

	locales: [
		"ar-SA",
		// Existing production locale.
		"de-DE",
	],

	json: {
		indent: 2,
	},
});
`);

		await addLocaleToConfig("zh-CN");

		const { readFile } = await import("node:fs/promises");
		const content = await readFile(configPath, "utf8");

		expect(content).toContain("// Project translation configuration.");
		expect(content).toContain("// Existing production locale.");
		expect(content).toContain('"zh-CN"');
		expect(content).toContain('directory: "app/i18n"');
		expect(content).toContain('source: "en-US"');
		expect(content).toContain("indent: 2");
	});

	it("leaves the config unchanged when the locale already exists", async () => {
		await writeConfig(`import { defineConfig } from "tring";

export default defineConfig({
	locales: ["ar-SA", "fr-FR", "de-DE"],
});
`);

		const { readFile } = await import("node:fs/promises");
		const before = await readFile(configPath, "utf8");

		await addLocaleToConfig("de-DE");

		const after = await readFile(configPath, "utf8");

		expect(after).toBe(before);
	});
});
