import type { TranslationFile } from "../file";
import type { TranslationLocale } from "../locale";

/**
 * Defines how a translation layout resolves locales
 * and discovers their translation files.
 *
 * A layout adapter is responsible only for translating
 * the configured layout into the common translation model.
 */
export interface TranslationLayoutAdapter {
	/**
	 * Resolves a locale into its location according to the layout.
	 */
	resolveLocale(directory: string, locale: string): TranslationLocale;

	/**
	 * Discovers the translation files belonging to a resolved locale.
	 */
	discoverFiles(locale: TranslationLocale): Promise<TranslationFile[]>;
}
