import { Gap, Indent, logger } from "@/logger";
import { MESSAGES } from "@/messages";
import type { TranslationValueComparison } from "@/translation";

export function printCompareHeader(resource: string): void {
	logger.text(MESSAGES.compareTitle, {
		bold: true,
	});

	logger.newLine();

	logger.text(resource, {
		bold: true,
	});

	logger.newLine();
}

export function printTranslationComparisons(
	comparisons: TranslationValueComparison[],
	locales: string[],
): void {
	for (const [index, comparison] of comparisons.entries()) {
		if (index > 0) {
			logger.newLine();
			logger.newLine();
		}

		logger.text(`key: ${comparison.key}`, {
			bold: true,
		});

		logger.newLine();

		for (const locale of locales) {
			const value = comparison.values[locale];

			if (value === undefined) {
				logger.separateWarningMark(locale, "MISSING", {
					indent: Indent.level1,
					gap: Gap.level1,
				});

				continue;
			}

			if (value === "") {
				logger.separate(locale, "", {
					indent: Indent.level1,
					gap: Gap.level1,
				});

				continue;
			}

			logger.separate(locale, value, {
				indent: Indent.level1,
				gap: Gap.level1,
			});
		}
	}
}

export function printComparePagination(shown: number, total: number): void {
	logger.newLine();
	logger.text(`Showing ${shown} of ${total} keys`);
}
