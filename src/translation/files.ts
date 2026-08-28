import type { TranslationFile } from "./file";

export function getTranslationFilesByLocale(
	files: TranslationFile[],
	locale: string,
): TranslationFile[] {
	return files.filter((file) => file.locale === locale);
}

export function findTranslationFile(
	files: TranslationFile[],
	locale: string,
	key: string,
): TranslationFile | undefined {
	return files.find((file) => file.locale === locale && file.key === key);
}
