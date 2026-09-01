import type { TringConfig } from "@/config";
import {
	discoverTranslationFiles,
	findTranslationFile,
	findTranslationMissingIssues,
	getTranslationFilesByLocale,
	readTranslationFile,
	type TranslationFile,
	type TranslationMissingIssue,
} from "@/translation";

export interface MissingApplicationResult {
	issues: TranslationMissingIssue[];
}

/** Finds missing translations across configured locales. */
export async function missingApplication(
	config: TringConfig,
): Promise<MissingApplicationResult> {
	const files = await discoverTranslationFiles(config);

	const sourceFiles = getTranslationFilesByLocale(files, config.source);

	const issues: TranslationMissingIssue[] = [];

	for (const sourceFile of sourceFiles) {
		const sourceDocument = await readTranslationFile(sourceFile);

		const targetFiles = config.locales
			.map((locale) => findTranslationFile(files, locale, sourceFile.key))
			.filter((file): file is TranslationFile => file !== undefined);

		const targetDocuments = await Promise.all(
			targetFiles.map((file) => readTranslationFile(file)),
		);

		issues.push(
			...findTranslationMissingIssues(
				sourceDocument,
				targetDocuments,
				config.locales,
			),
		);
	}

	return {
		issues,
	};
}
