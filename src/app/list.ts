import type { TringConfig } from "@/config";
import { discoverTranslationFiles, type TranslationFile } from "@/translation";

export interface TranslationResourceSummary {
	locale: string;
	files: TranslationFile[];
}

export interface ListApplicationResult {
	source: string;
	resources: TranslationResourceSummary[];
}

export async function listApplication(
	config: TringConfig,
): Promise<ListApplicationResult> {
	const files = await discoverTranslationFiles(config);

	const locales = new Set([config.source, ...config.locales]);

	const resources = [...locales].map((locale) => ({
		locale,
		files: files
			.filter((file) => file.locale === locale)
			.sort((a, b) => a.key.localeCompare(b.key)),
	}));

	return {
		source: config.source,
		resources,
	};
}
