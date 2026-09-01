import type { TringConfig } from "@/config";
import {
	discoverTranslationFiles,
	extractTranslationKeys,
	getTranslationFilesByLocale,
	readTranslationFile,
	type TranslationFile,
} from "@/translation";

/** Finds translation resources containing the specified key. */
export async function findTranslationKeyResources(
	config: TringConfig,
	key: string,
): Promise<TranslationFile[]> {
	const files = await discoverTranslationFiles(config);

	const sourceFiles = getTranslationFilesByLocale(files, config.source);

	const resources: TranslationFile[] = [];

	for (const file of sourceFiles) {
		const document = await readTranslationFile(file);
		const keys = extractTranslationKeys(document.data);

		if (keys.includes(key)) {
			resources.push(file);
		}
	}

	return resources;
}
