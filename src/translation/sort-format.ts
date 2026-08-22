import type { TranslationSortResult } from "@/app";
import { COLUMN_SEPARATOR, SYMBOLS } from "@/constants";

export function formatTranslationSort(
	results: TranslationSortResult[],
): string {
	const modified = results.filter((result) => result.isModified);

	if (modified.length === 0) {
		return [
			"Translation Sort",
			"",
			`${SYMBOLS.success} All translation files are already sorted.`,
		].join("\n");
	}

	const lines = [
		"Translation Sort",
		"",
		`${SYMBOLS.success} Sorted ${modified.length} translation file${
			modified.length === 1 ? "" : "s"
		}.`,
		"",
		"Modified:",
		"",
	];

	for (const result of modified) {
		lines.push(`${result.file.locale} ${COLUMN_SEPARATOR} ${result.file.key}`);
	}

	return lines.join("\n");
}
