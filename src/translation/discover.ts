import type { TringConfig } from "@/config";

import type { TranslationFile } from "./file";
import { getTranslationLayoutAdapter } from "./layouts";

/** Discovers translation files for the configured locales. */
export async function discoverTranslationFiles(
	config: TringConfig,
): Promise<TranslationFile[]> {
	const layout = getTranslationLayoutAdapter(config.layout);

	const locales = new Set([config.source, ...config.locales]);

	const files: TranslationFile[] = [];

	for (const locale of locales) {
		const translationLocale = layout.resolveLocale(config.directory, locale);

		const discoveredFiles = await layout.discoverFiles(translationLocale);

		files.push(...discoveredFiles);
	}

	return files;
}
