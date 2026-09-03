import type { TringConfig } from "@/config";
import {
	compareTranslationValues,
	discoverTranslationFiles,
	findTranslationFile,
	getTranslationFilesByLocale,
	readTranslationFile,
	type TranslationFile,
	type TranslationValueComparison,
} from "@/translation";

export interface CompareApplicationResult {
	source: string;
	resources: TranslationFile[];
}

export interface CompareResourceResult {
	resource: TranslationFile;
	comparisons: TranslationValueComparison[];
}

/** Lists translation resources for the source locale. */
export async function compareApplication(
	config: TringConfig,
): Promise<CompareApplicationResult> {
	const files = await discoverTranslationFiles(config);

	const resources = getTranslationFilesByLocale(files, config.source).sort(
		(a, b) => a.key.localeCompare(b.key),
	);

	return {
		source: config.source,
		resources,
	};
}

/** Compares a translation resource across configured locales. */
export async function compareResource(
	config: TringConfig,
	resource: TranslationFile,
): Promise<CompareResourceResult> {
	const files = await discoverTranslationFiles(config);

	const source = findTranslationFile(files, config.source, resource.key);

	if (!source) {
		throw new Error(
			`Translation resource was not found in source locale: ${resource.key}`,
		);
	}

	const targets = config.locales
		.map((locale) => findTranslationFile(files, locale, resource.key))
		.filter((file): file is TranslationFile => file !== undefined);

	const sourceDocument = await readTranslationFile(source);
	const targetDocuments = await Promise.all(
		targets.map((file) => readTranslationFile(file)),
	);

	return {
		resource,
		comparisons: compareTranslationValues(
			sourceDocument,
			targetDocuments,
			[config.source, ...config.locales],
			config.keyRule,
		),
	};
}
