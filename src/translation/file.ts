/**
 * A discovered translation file.
 *
 * | Property        | Responsibility                                      |
 * | --------------- | --------------------------------------------------- |
 * | `locale`        | Locale this file belongs to                         |
 * | `directory`     | Directory containing the file                       |
 * | `name`          | Logical name used for matching                      |
 * | `filename`      | Actual filename                                     |
 * | `key`           | File identifier used in reports                     |
 * | `isLocaleFile`  | Whether the file itself represents the locale       |
 * | `path`          | Actual path to the file                             |
 */
export interface TranslationFile {
	/**
	 * Locale this translation file belongs to.
	 */
	locale: string;

	/**
	 * Directory containing the translation file,
	 * relative to the locale directory.
	 */
	directory: string;

	/**
	 * Logical name used to match translation files
	 * between source and target locales.
	 */
	name: string;

	/**
	 * Actual JSON filename.
	 */
	filename: string;

	/**
	 * File identifier used in reports.
	 */
	key: string;

	/**
	 * Whether this file represents the locale itself.
	 *
	 * This is true for the files layout and false
	 * for the directories layout.
	 */
	isLocaleFile: boolean;

	/**
	 * Absolute or resolved path to the translation file.
	 */
	path: string;
}
