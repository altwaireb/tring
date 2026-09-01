import { compareTranslationKeys } from "./compare";
import { compareTranslationFiles } from "./compare-files";
import type { TranslationDocument } from "./document";
import type { TranslationFile } from "./file";
import type { TranslationKey } from "./key";
import { extractTranslationKeys } from "./keys";
import { readTranslationFile } from "./read";

export interface TranslationFileAnalysis {
	source: TranslationFile;
	target: TranslationFile;
	missingKeys: TranslationKey[];
	extraKeys: TranslationKey[];
}

export interface TranslationAnalysis {
	sourceLocale: string;
	targetLocale: string;

	missingFiles: TranslationFile[];
	extraFiles: TranslationFile[];
	files: TranslationFileAnalysis[];
}

/** Analyzes a source and target translation document. */
export function analyzeTranslationDocuments(
	source: TranslationDocument,
	target: TranslationDocument,
): TranslationFileAnalysis {
	const sourceKeys = extractTranslationKeys(source.data);
	const targetKeys = extractTranslationKeys(target.data);

	const comparison = compareTranslationKeys(sourceKeys, targetKeys);

	return {
		source: source.file,
		target: target.file,
		missingKeys: comparison.missing,
		extraKeys: comparison.extra,
	};
}

/** Analyzes translation files between a source and target locale. */
export async function analyzeTranslations(
	sourceLocale: string,
	targetLocale: string,
	sourceFiles: TranslationFile[],
	targetFiles: TranslationFile[],
): Promise<TranslationAnalysis> {
	const fileComparison = compareTranslationFiles(sourceFiles, targetFiles);

	const files: TranslationFileAnalysis[] = [];

	for (const matched of fileComparison.matched) {
		const source = await readTranslationFile(matched.source);
		const target = await readTranslationFile(matched.target);

		files.push(analyzeTranslationDocuments(source, target));
	}

	return {
		sourceLocale,
		targetLocale,
		missingFiles: fileComparison.missing,
		extraFiles: fileComparison.extra,
		files,
	};
}
