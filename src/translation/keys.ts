import { isJsonObject, type JsonObject } from "@/json";
import { isTranslationKey, type TranslationKey } from "./key";

/** Extracts translation keys from a JSON document. */
export function extractTranslationKeys(document: JsonObject): TranslationKey[] {
	const keys: TranslationKey[] = [];

	function visit(object: JsonObject, parents: string[]): void {
		for (const [key, value] of Object.entries(object)) {
			if (!isTranslationKey(key)) {
				throw new Error(`Invalid translation key: "${key}".`);
			}

			const path = [...parents, key];

			if (typeof value === "string") {
				keys.push(path.join(".") as TranslationKey);
				continue;
			}

			if (isJsonObject(value)) {
				visit(value, path);
				continue;
			}

			throw new Error(`Invalid translation value at "${path.join(".")}".`);
		}
	}

	visit(document, []);

	return keys;
}
