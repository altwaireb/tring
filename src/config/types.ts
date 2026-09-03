/**
 * Translation file layout.
 */
export enum TranslationLayout {
	/**
	 * Each locale uses a single JSON file.
	 *
	 * @example "app/i18n/en-US.json"
	 */
	files = "files",

	/**
	 * Each locale uses a directory containing JSON files.
	 *
	 * @example "app/i18n/en-US/common.json"
	 */
	directories = "directories",
}

/**
 * Translation key validation rules.
 */
export enum TranslationKeyRule {
	/**
	 * ASCII letters only.
	 */
	alpha = "alpha",

	/**
	 * ASCII letters and numbers only.
	 */
	alphaNumeric = "alphaNumeric",

	/**
	 * ASCII letters, numbers, underscores, and dashes.
	 *
	 * Underscores and dashes cannot appear at the beginning or end.
	 */
	alphaDash = "alphaDash",

	/**
	 * Printable ASCII characters except spaces.
	 */
	ascii = "ascii",

	/**
	 * Printable ASCII characters including spaces.
	 */
	asciiSpaces = "asciiSpaces",
}

/**
 * JSON formatting options.
 */
export interface JsonOptions {
	/**
	 * Number of spaces used for indentation.
	 *
	 * @default 2
	 */
	indent?: number;
}

/**
 * Tring configuration.
 */
export interface TringConfig {
	/**
	 * Translation directory.
	 *
	 * @example "app/i18n"
	 */
	directory: string;

	/**
	 * Translation file layout.
	 *
	 * @default TranslationLayout.directories
	 */
	layout: TranslationLayout;

	/**
	 * Source locale.
	 *
	 * @example "en-US"
	 */
	source: string;

	/**
	 * Supported locales.
	 */
	locales: readonly string[];

	/**
	 * Translation key validation rule.
	 *
	 * @default TranslationKeyRule.alphaDash
	 */
	keyRule?: TranslationKeyRule;

	/**
	 * JSON formatting options.
	 */
	json?: JsonOptions;
}
