import type { TringConfig } from "@/config";
import {
	discoverTranslationFiles,
	findTranslationMissingIssues,
	readTranslationFile,
	type TranslationFile,
	type TranslationMissingIssue,
} from "@/translation";

export interface MissingApplicationResult {
	issues: TranslationMissingIssue[];
}

export async function missingApplication(
	config: TringConfig,
): Promise<MissingApplicationResult> {
	const files = await discoverTranslationFiles(config);

	const sourceFiles = files
		.filter((file) => file.locale === config.source)
		.sort((a, b) => a.key.localeCompare(b.key));

	const issues: TranslationMissingIssue[] = [];

	for (const sourceFile of sourceFiles) {
		const sourceDocument = await readTranslationFile(sourceFile);

		const targetFiles = config.locales
			.map((locale) =>
				files.find(
					(file) => file.locale === locale && file.key === sourceFile.key,
				),
			)
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
