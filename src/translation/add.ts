import type { TranslationDocument } from "./document";
import type { TranslationFile } from "./file";
import { extractTranslationKeys } from "./keys";
import { getTranslationValue } from "./values";

export interface TranslationAddChange {
	key: string;
	sourceValue: string;
}

export interface TranslationAddFile {
	locale: string;
	source: TranslationFile;
	target?: TranslationFile;
	changes: TranslationAddChange[];
}

export interface TranslationAddPlan {
	files: TranslationAddFile[];
}

export function createTranslationAddPlan(
	source: TranslationDocument,
	target: TranslationDocument | undefined,
	locale: string,
): TranslationAddPlan {
	const sourceKeys = extractTranslationKeys(source.data);
	const changes: TranslationAddChange[] = [];

	for (const key of sourceKeys) {
		const sourceValue = getTranslationValue(source.data, key);

		if (sourceValue === undefined) {
			continue;
		}

		const targetValue = target
			? getTranslationValue(target.data, key)
			: undefined;

		// Existing keys are never modified by add.
		// This includes existing empty values.
		if (targetValue !== undefined) {
			continue;
		}

		changes.push({
			key,
			sourceValue,
		});
	}

	if (changes.length === 0) {
		return {
			files: [],
		};
	}

	return {
		files: [
			{
				locale,
				source: source.file,
				...(target ? { target: target.file } : {}),
				changes,
			},
		],
	};
}
