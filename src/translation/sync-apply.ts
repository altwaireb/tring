import type { JsonObject } from "@/json";

import type { TranslationSyncChange } from "./sync";

export function applyTranslationSyncChanges(
	data: JsonObject,
	changes: readonly TranslationSyncChange[],
	empty: boolean,
): JsonObject {
	for (const change of changes) {
		setTranslationValue(data, change.key, empty ? "" : change.sourceValue);
	}

	return data;
}

function setTranslationValue(
	document: JsonObject,
	key: TranslationSyncChange["key"],
	value: string,
): void {
	const parts = key.split(".");
	const lastPart = parts.pop();

	if (lastPart === undefined) {
		return;
	}

	let current = document;

	for (const part of parts) {
		const existing = current[part];

		if (
			typeof existing !== "object" ||
			existing === null ||
			Array.isArray(existing)
		) {
			current[part] = {};
		}

		current = current[part] as JsonObject;
	}

	current[lastPart] = value;
}
