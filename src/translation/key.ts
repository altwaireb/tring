export type TranslationKey = string;

const TRANSLATION_KEY_PATTERN = /^[A-Za-z](?:[A-Za-z0-9_-]*[A-Za-z0-9])?$/;

/** Checks whether a value is a valid translation key. */
export function isTranslationKey(value: string): value is TranslationKey {
	return TRANSLATION_KEY_PATTERN.test(value);
}
