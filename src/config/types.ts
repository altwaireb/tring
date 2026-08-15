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
 * JSON formatting options.
 */
export interface JsonOptions {
	/**
	 * Sort translation keys alphabetically.
	 *
	 * @default false
	 */
	sortKeys?: boolean;

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
	 * JSON formatting options.
	 */
	json?: JsonOptions;
}
