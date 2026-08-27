import type { TranslationChange } from "./apply";
import type { TranslationDocument } from "./document";
import type { TranslationFile } from "./file";
import { extractTranslationKeys } from "./keys";
import { getTranslationValue } from "./values";

export type TranslationSyncChange = TranslationChange;

export interface TranslationSyncFile {
	locale: string;
	source: TranslationFile;
	target?: TranslationFile;
	changes: TranslationSyncChange[];
}

export interface TranslationSyncPlan {
	files: TranslationSyncFile[];
}

export function createTranslationSyncPlan(
	source: TranslationDocument,
	targets: TranslationDocument[],
	locales: readonly string[],
): TranslationSyncPlan {
	const sourceKeys = extractTranslationKeys(source.data);

	const targetsByLocale = new Map(
		targets.map((document) => [document.file.locale, document]),
	);

	const files: TranslationSyncFile[] = [];

	for (const locale of locales) {
		const target = targetsByLocale.get(locale);
		const changes: TranslationSyncChange[] = [];

		for (const key of sourceKeys) {
			const sourceValue = getTranslationValue(source.data, key);

			if (sourceValue === undefined) {
				continue;
			}

			const targetValue = target
				? getTranslationValue(target.data, key)
				: undefined;

			if (targetValue !== undefined && targetValue !== "") {
				continue;
			}

			changes.push({
				key,
				sourceValue,
			});
		}

		if (changes.length === 0) {
			continue;
		}

		files.push({
			locale,
			source: source.file,
			...(target ? { target: target.file } : {}),
			changes,
		});
	}

	return {
		files,
	};
}
