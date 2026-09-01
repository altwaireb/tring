import type { JsonObject } from "@/json";

export interface TranslationChange {
	key: string;
	sourceValue: string;
}

/** Applies translation changes to a JSON document. */
export function applyTranslationChanges(
	data: JsonObject,
	changes: readonly TranslationChange[],
	empty: boolean,
): JsonObject {
	for (const change of changes) {
		setTranslationValue(data, change.key, empty ? "" : change.sourceValue);
	}

	return data;
}

function setTranslationValue(
	document: JsonObject,
	key: string,
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
