/**
 * A resolved translation locale.
 *
 * The layout resolves a configured locale into a filesystem location.
 *
 * Each property has a distinct responsibility:
 *
 * - `locale`: The locale identifier, such as `en-US` or `ar-SA`.
 * - `path`: The filesystem location where the locale is stored
 *   according to the configured translation layout.
 */
export interface TranslationLocale {
	/**
	 * The locale identifier.
	 */
	locale: string;

	/**
	 * The filesystem location where the locale is stored.
	 */
	path: string;
}
