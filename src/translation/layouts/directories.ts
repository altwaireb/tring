import { join, readdirWithFileTypes } from "@/filesystem";

import type { TranslationFile } from "../file";
import type { TranslationLocale } from "../locale";
import type { TranslationLayoutAdapter } from "./adapter";

export const directoriesLayout: TranslationLayoutAdapter = {
	resolveLocale(directory, locale): TranslationLocale {
		return {
			locale,
			path: join(directory, locale),
		};
	},

	async discoverFiles(locale): Promise<TranslationFile[]> {
		const entries = await readdirWithFileTypes(locale.path);

		entries.sort((a, b) => a.name.localeCompare(b.name));

		const files: TranslationFile[] = [];

		for (const entry of entries) {
			if (!entry.isFile() || !entry.name.endsWith(".json")) {
				continue;
			}

			files.push({
				locale: locale.locale,
				directory: "",
				name: entry.name.replace(/\.json$/, ""),
				filename: entry.name,
				key: entry.name,
				isLocaleFile: false,
				path: join(locale.path, entry.name),
			});
		}

		return files;
	},
};
