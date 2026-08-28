import type { TringConfig } from "@/config";
import {
	compareTranslationFiles,
	compareTranslationKeys,
	discoverTranslationFiles,
	extractTranslationKeys,
	getEmptyTranslationKeys,
	getTranslationFilesByLocale,
	isTranslationObjectSorted,
	readTranslationFile,
} from "@/translation";

export type TranslationCheckIssueType =
	| "missing-file"
	| "extra-file"
	| "missing-key"
	| "extra-key"
	| "empty-value"
	| "unsorted";

export interface TranslationCheckIssue {
	type: TranslationCheckIssueType;
	locale: string;
	file: string;
	key?: string;
}

export interface CheckApplicationOptions {
	skipSort?: boolean;
	skipEmpty?: boolean;
}

export interface CheckApplicationResult {
	exitCode: number;
	issues: TranslationCheckIssue[];
}

export async function checkApplication(
	config: TringConfig,
	options: CheckApplicationOptions = {},
): Promise<CheckApplicationResult> {
	const files = await discoverTranslationFiles(config);

	const sourceFiles = getTranslationFilesByLocale(files, config.source);

	const issues: TranslationCheckIssue[] = [];

	for (const locale of config.locales) {
		const targetFiles = getTranslationFilesByLocale(files, locale);

		const fileComparison = compareTranslationFiles(sourceFiles, targetFiles);

		for (const file of fileComparison.missing) {
			issues.push({
				type: "missing-file",
				locale,
				file: file.key,
			});
		}

		for (const file of fileComparison.extra) {
			issues.push({
				type: "extra-file",
				locale,
				file: file.key,
			});
		}

		for (const matched of fileComparison.matched) {
			const sourceDocument = await readTranslationFile(matched.source);
			const targetDocument = await readTranslationFile(matched.target);

			const sourceKeys = extractTranslationKeys(sourceDocument.data);
			const targetKeys = extractTranslationKeys(targetDocument.data);

			const keyComparison = compareTranslationKeys(sourceKeys, targetKeys);

			for (const key of keyComparison.missing) {
				issues.push({
					type: "missing-key",
					locale,
					file: matched.target.key,
					key,
				});
			}

			for (const key of keyComparison.extra) {
				issues.push({
					type: "extra-key",
					locale,
					file: matched.target.key,
					key,
				});
			}

			if (!options.skipEmpty) {
				for (const key of getEmptyTranslationKeys(targetDocument.data)) {
					issues.push({
						type: "empty-value",
						locale,
						file: matched.target.key,
						key,
					});
				}
			}

			if (
				!options.skipSort &&
				!isTranslationObjectSorted(targetDocument.data)
			) {
				issues.push({
					type: "unsorted",
					locale,
					file: matched.target.key,
				});
			}
		}
	}

	return {
		exitCode: issues.length > 0 ? 1 : 0,
		issues,
	};
}
