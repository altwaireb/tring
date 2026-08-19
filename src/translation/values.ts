import type { JsonObject } from "@/json";

import type { TranslationKey } from "./key";

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
