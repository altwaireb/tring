import { exists, join, readdirWithFileTypes } from "@/filesystem";

import type { TranslationFile } from "../file";
import type { TranslationLocale } from "../locale";
import type { TranslationLayoutAdapter } from "./adapter";

/** Resolves translation files stored in locale directories. */
export const directoriesLayout: TranslationLayoutAdapter = {
	resolveLocale(directory, locale): TranslationLocale {
		return {
			locale,
			path: join(directory, locale),
		};
	},

	async discoverFiles(locale): Promise<TranslationFile[]> {
		if (!(await exists(locale.path))) {
			return [];
		}

		const files: TranslationFile[] = [];

		async function visit(
			path: string,
			relativeDirectory: string,
		): Promise<void> {
			const entries = await readdirWithFileTypes(path);

			entries.sort((a, b) => a.name.localeCompare(b.name));

			for (const entry of entries) {
				const entryPath = join(path, entry.name);

				if (entry.isDirectory()) {
					const directory = relativeDirectory
						? `${relativeDirectory}/${entry.name}`
						: entry.name;

					await visit(entryPath, directory);
					continue;
				}

				if (!entry.isFile() || !entry.name.endsWith(".json")) {
					continue;
				}

				const key = relativeDirectory
					? `${relativeDirectory}/${entry.name}`
					: entry.name;

				files.push({
					locale: locale.locale,
					directory: relativeDirectory,
					name: entry.name.replace(/\.json$/, ""),
					filename: entry.name,
					key,
					isLocaleFile: false,
					path: entryPath,
				});
			}
		}

		await visit(locale.path, "");

		return files;
	},
};
