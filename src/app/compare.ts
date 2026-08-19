import type { TringConfig } from "@/config";
import {
	compareTranslationValues,
	discoverTranslationFiles,
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

export async function compareApplication(
	config: TringConfig,
): Promise<CompareApplicationResult> {
	const files = await discoverTranslationFiles(config);

	const resources = files
		.filter((file) => file.locale === config.source)
		.sort((a, b) => a.key.localeCompare(b.key));

	return {
		source: config.source,
		resources,
	};
}

export async function compareResource(
	config: TringConfig,
	resource: TranslationFile,
): Promise<CompareResourceResult> {
	const files = await discoverTranslationFiles(config);

	const source = files.find(
		(file) => file.locale === config.source && file.key === resource.key,
	);

	if (!source) {
		throw new Error(
			`Translation resource was not found in source locale: ${resource.key}`,
		);
	}

	const targets = config.locales
		.map((locale) =>
			files.find((file) => file.locale === locale && file.key === resource.key),
		)
		.filter((file): file is TranslationFile => file !== undefined);

	const sourceDocument = await readTranslationFile(source);
	const targetDocuments = await Promise.all(
		targets.map((file) => readTranslationFile(file)),
	);

	return {
		resource,
		comparisons: compareTranslationValues(sourceDocument, targetDocuments, [
			config.source,
			...config.locales,
		]),
	};
}
