import type { JsonObject } from "@/json";

import type { TranslationFile } from "./file";

/**
 * A parsed translation document.
 *
 * A translation document combines the discovered translation
 * file metadata with its parsed JSON content.
 */
export interface TranslationDocument {
	/**
	 * The translation file from which the document was read.
	 */
	file: TranslationFile;

	/**
	 * The parsed translation data.
	 */
	data: JsonObject;
}
