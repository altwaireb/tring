import { TranslationKeyRule } from "@/config";

export type TranslationKey = string;

const TRANSLATION_KEY_PATTERNS: Record<TranslationKeyRule, RegExp> = {
	[TranslationKeyRule.alpha]: /^[A-Za-z]+$/,
	[TranslationKeyRule.alphaNumeric]: /^[A-Za-z0-9]+$/,
	[TranslationKeyRule.alphaDash]: /^[A-Za-z0-9](?:[A-Za-z0-9_-]*[A-Za-z0-9])?$/,
	[TranslationKeyRule.ascii]: /^[\x21-\x7E]+$/,
	[TranslationKeyRule.asciiSpaces]: /^[\x20-\x7E]+$/,
};

/** Checks whether a value is a valid translation key. */
export function isTranslationKey(
	value: string,
	rule = TranslationKeyRule.alphaDash,
): value is TranslationKey {
	return TRANSLATION_KEY_PATTERNS[rule].test(value);
}
