import { isJsonObject, type JsonObject } from "@/json";

/** Compares two translation key names for sorting. */
export function compareTranslationKeyNames(
	source: string,
	target: string,
): number {
	const comparison = source.localeCompare(target, undefined, {
		numeric: true,
		sensitivity: "base",
	});

	if (comparison !== 0) {
		return comparison;
	}

	return source.localeCompare(target, undefined, {
		numeric: true,
		sensitivity: "variant",
	});
}

/** Sorts translation keys recursively in a JSON object. */
export function sortTranslationObject(object: JsonObject): JsonObject {
	return Object.fromEntries(
		Object.entries(object)
			.sort(([source], [target]) => compareTranslationKeyNames(source, target))
			.map(([key, value]) => [
				key,
				isJsonObject(value) ? sortTranslationObject(value) : value,
			]),
	);
}

/** Checks whether translation keys are recursively sorted. */
export function isTranslationObjectSorted(object: JsonObject): boolean {
	const keys = Object.keys(object);

	for (let index = 1; index < keys.length; index += 1) {
		const previous = keys[index - 1];
		const current = keys[index];

		if (previous === undefined || current === undefined) {
			return false;
		}

		if (compareTranslationKeyNames(previous, current) > 0) {
			return false;
		}
	}

	for (const value of Object.values(object)) {
		if (isJsonObject(value) && !isTranslationObjectSorted(value)) {
			return false;
		}
	}

	return true;
}
