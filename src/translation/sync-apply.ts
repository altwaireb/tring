import type { JsonObject } from "@/json";

import { applyTranslationChanges } from "./apply";
import type { TranslationSyncChange } from "./sync";

export function applyTranslationSyncChanges(
	data: JsonObject,
	changes: readonly TranslationSyncChange[],
	empty: boolean,
): JsonObject {
	return applyTranslationChanges(data, changes, empty);
}
