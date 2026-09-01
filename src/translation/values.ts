import type { JsonObject } from "@/json";

import type { TranslationKey } from "./key";

/** Returns the translation value for a key. */
export function getTranslationValue(
	document: JsonObject,
	key: TranslationKey,
): string | undefined {
	const parts = key.split(".");
	let current: unknown = document;

	for (const part of parts) {
		if (typeof current !== "object" || current === null || !(part in current)) {
			return undefined;
		}

		current = (current as Record<string, unknown>)[part];
	}

	return typeof current === "string" ? current : undefined;
}

/** Finds translation keys with empty values. */
export function getEmptyTranslationKeys(
	document: JsonObject,
): TranslationKey[] {
	const keys: TranslationKey[] = [];

	function visit(value: JsonObject, prefix = ""): void {
		for (const [key, child] of Object.entries(value)) {
			const translationKey = prefix ? `${prefix}.${key}` : key;

			if (typeof child === "string") {
				if (child === "") {
					keys.push(translationKey);
				}

				continue;
			}

			if (typeof child === "object" && child !== null) {
				visit(child as JsonObject, translationKey);
			}
		}
	}

	visit(document);

	return keys;
}
