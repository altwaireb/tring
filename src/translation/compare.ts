import type { TranslationKey } from "./key";

export interface TranslationKeyComparison {
	missing: TranslationKey[];
	extra: TranslationKey[];
}

/** Compares source and target translation keys. */
export function compareTranslationKeys(
	source: TranslationKey[],
	target: TranslationKey[],
): TranslationKeyComparison {
	const sourceKeys = new Set(source);
	const targetKeys = new Set(target);

	const missing = source.filter((key) => !targetKeys.has(key));

	const extra = target.filter((key) => !sourceKeys.has(key));

	return {
		missing,
		extra,
	};
}
