import { TranslationKeyRule } from "@/config";

import type { TranslationDocument } from "./document";
import type { TranslationKey } from "./key";
import { extractTranslationKeys } from "./keys";
import { getTranslationValue } from "./values";

export interface TranslationValueComparison {
	key: TranslationKey;
	values: Record<string, string | undefined>;
}

/** Compares translation values across configured locales. */
export function compareTranslationValues(
	source: TranslationDocument,
	targets: TranslationDocument[],
	locales: string[],
	rule = TranslationKeyRule.alphaDash,
): TranslationValueComparison[] {
	const keys = extractTranslationKeys(source.data, rule);

	return keys.map((key) => {
		const values: Record<string, string | undefined> = {};

		for (const locale of locales) {
			values[locale] = undefined;
		}

		values[source.file.locale] = getTranslationValue(source.data, key);

		for (const document of targets) {
			values[document.file.locale] = getTranslationValue(document.data, key);
		}

		return {
			key,
			values,
		};
	});
}
