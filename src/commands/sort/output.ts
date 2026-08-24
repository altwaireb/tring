import type { TranslationSortResult } from "@/app";
import { Gap, Indent, logger } from "@/logger";
import { MESSAGES } from "@/messages";

export function printSortResults(results: TranslationSortResult[]): void {
	const modified = results.filter((result) => result.isModified);

	logger.text(MESSAGES.sortTitle, {
		bold: true,
	});

	logger.newLine();

	if (modified.length === 0) {
		logger.successIcon(MESSAGES.sortAllSorted);
		return;
	}

	logger.successIcon(MESSAGES.sortSorted(modified.length));

	logger.newLine();

	logger.text(MESSAGES.sortModified, {
		bold: true,
	});

	logger.newLine();

	for (const result of modified) {
		logger.separate(result.file.locale, result.file.key, {
			indent: Indent.level1,
			gap: Gap.level1,
		});
	}
}
