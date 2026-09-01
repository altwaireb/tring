import type { TranslationFile } from "./file";

/** Returns translation files for the specified locale. */
export function getTranslationFilesByLocale(
	files: TranslationFile[],
	locale: string,
): TranslationFile[] {
	return files.filter((file) => file.locale === locale);
}

/** Finds a translation file by locale and key. */
export function findTranslationFile(
	files: TranslationFile[],
	locale: string,
	key: string,
): TranslationFile | undefined {
	return files.find((file) => file.locale === locale && file.key === key);
}
