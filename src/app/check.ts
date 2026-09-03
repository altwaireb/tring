import { join } from "node:path";

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
	title: string;
	type: TranslationCheckIssueType;
	message: string;
	locale: string;
	file: string;
	key?: string;
	path: string;
	normalizedPath: string;
}

export interface CheckApplicationOptions {
	skipSort?: boolean;
	skipEmpty?: boolean;
}

export interface CheckApplicationResult {
	exitCode: number;
	issues: TranslationCheckIssue[];
}

/** Checks translation files for consistency issues. */
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
			const path = join(config.directory, locale, file.key);
			const normalizedPath = path.replaceAll("\\", "/");

			issues.push({
				title: "Missing file",
				type: "missing-file",
				message: "Missing translation file.",
				locale,
				file: file.key,
				path,
				normalizedPath,
			});
		}

		for (const file of fileComparison.extra) {
			const path = join(config.directory, locale, file.key);
			const normalizedPath = path.replaceAll("\\", "/");

			issues.push({
				title: "Extra file",
				type: "extra-file",
				message: "Extra translation file.",
				locale,
				file: file.key,
				path,
				normalizedPath,
			});
		}

		for (const matched of fileComparison.matched) {
			const sourceDocument = await readTranslationFile(matched.source);
			const targetDocument = await readTranslationFile(matched.target);

			const sourceKeys = extractTranslationKeys(
				sourceDocument.data,
				config.keyRule,
			);
			const targetKeys = extractTranslationKeys(
				targetDocument.data,
				config.keyRule,
			);

			const keyComparison = compareTranslationKeys(sourceKeys, targetKeys);

			const path = join(config.directory, locale, matched.target.key);
			const normalizedPath = path.replaceAll("\\", "/");

			for (const key of keyComparison.missing) {
				issues.push({
					title: "Missing key",
					type: "missing-key",
					message: `Missing translation key: ${key}`,
					locale,
					file: matched.target.key,
					key,
					path,
					normalizedPath,
				});
			}

			for (const key of keyComparison.extra) {
				issues.push({
					title: "Extra key",
					type: "extra-key",
					message: `Extra translation key: ${key}`,
					locale,
					file: matched.target.key,
					key,
					path,
					normalizedPath,
				});
			}

			if (!options.skipEmpty) {
				for (const key of getEmptyTranslationKeys(targetDocument.data)) {
					issues.push({
						title: "Empty value",
						type: "empty-value",
						message: `Empty translation value: ${key}`,
						locale,
						file: matched.target.key,
						key,
						path,
						normalizedPath,
					});
				}
			}

			if (
				!options.skipSort &&
				!isTranslationObjectSorted(targetDocument.data)
			) {
				issues.push({
					title: "Unsorted",
					type: "unsorted",
					message: "Translation keys are not sorted.",
					locale,
					file: matched.target.key,
					path,
					normalizedPath,
				});
			}
		}
	}

	return {
		exitCode: issues.length > 0 ? 1 : 0,
		issues,
	};
}
