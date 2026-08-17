import { describe, expect, it } from "vitest";

import { runListCommand } from "@/cli/commands/list";
import { defineConfig, TranslationLayout } from "@/config";

const config = defineConfig({
	directory: "tests/app/i18n/nested",
	layout: TranslationLayout.directories,
	source: "en-US",
	locales: ["ar-SA", "fr-FR", "de-DE"],
});

describe("list command", () => {
	it("lists translation resources without files by default", async () => {
		const result = await runListCommand(config);

		expect(result.exitCode).toBe(0);

		expect(result.output).toBe(`Translation Resources

Source: en-US

en-US (8 files)

ar-SA (7 files)

fr-FR (6 files)

de-DE (4 files)`);
	});

	it("lists translation resources with files", async () => {
		const result = await runListCommand(config, {
			showFiles: true,
		});

		expect(result.exitCode).toBe(0);

		expect(result.output).toBe(`Translation Resources

Source: en-US

en-US (8 files)
  auth.json
  common.json
  settings.json
  admin/
    roles.json
    users.json
  dashboard/
    overview.json
    analytics/
      reports.json
  notifications/
    email.json

ar-SA (7 files)
  auth.json
  common.json
  settings.json
  admin/
    roles.json
    users.json
  dashboard/
    overview.json
  notifications/
    email.json

fr-FR (6 files)
  auth.json
  common.json
  settings.json
  admin/
    users.json
  dashboard/
    overview.json
  notifications/
    email.json

de-DE (4 files)
  auth.json
  common.json
  admin/
    users.json
  dashboard/
    overview.json`);
	});

	it("lists file layout resources", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA"],
		});

		const result = await runListCommand(config);

		expect(result.exitCode).toBe(0);

		expect(result.output).toBe(`Translation Resources

Source: en-US

en-US (1 file)

ar-SA (1 file)`);
	});

	it("lists file layout resources with files", async () => {
		const config = defineConfig({
			directory: "tests/app/i18n/files",
			layout: TranslationLayout.files,
			source: "en-US",
			locales: ["ar-SA"],
		});

		const result = await runListCommand(config, {
			showFiles: true,
		});

		expect(result.exitCode).toBe(0);

		expect(result.output).toBe(`Translation Resources

Source: en-US

en-US (1 file)
  en-US.json

ar-SA (1 file)
  ar-SA.json`);
	});
});
