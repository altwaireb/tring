import type { TranslationDocument } from "./document";
import type { TranslationFile } from "./file";
import type { TranslationKey } from "./key";
import { extractTranslationKeys } from "./keys";
import { getTranslationValue } from "./values";

export interface TranslationMissingIssue {
	key: TranslationKey;
	locale: string;
	resource: TranslationFile;
	value: string | undefined;
	isMissing: boolean;
	isEmpty: boolean;
}

export function findTranslationMissingIssues(
	source: TranslationDocument,
	targets: TranslationDocument[],
	locales: readonly string[],
): TranslationMissingIssue[] {
	const keys = extractTranslationKeys(source.data);

	const targetsByLocale = new Map(
		targets.map((document) => [document.file.locale, document]),
	);

	const issues: TranslationMissingIssue[] = [];

	for (const locale of locales) {
		const target = targetsByLocale.get(locale);

		for (const key of keys) {
			const value = target ? getTranslationValue(target.data, key) : undefined;

			const isMissing = value === undefined;
			const isEmpty = value === "";

			if (!isMissing && !isEmpty) {
				continue;
			}

			issues.push({
				key,
				locale,
				resource: source.file,
				value,
				isMissing,
				isEmpty,
			});
		}
	}

	return issues;
}
