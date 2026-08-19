import type { TringConfig } from "@/config";
import {
	discoverTranslationFiles,
	extractTranslationKeys,
	readTranslationFile,
	type TranslationFile,
} from "@/translation";

export async function findTranslationKeyResources(
	config: TringConfig,
	key: string,
): Promise<TranslationFile[]> {
	const files = await discoverTranslationFiles(config);

	const sourceFiles = files
		.filter((file) => file.locale === config.source)
		.sort((a, b) => a.key.localeCompare(b.key));

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
