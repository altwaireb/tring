import { COLUMN_SEPARATOR, SYMBOLS } from "@/constants";

import type { TranslationValueComparison } from "./compare-values";

export function formatTranslationComparison(
	comparisons: TranslationValueComparison[],
	locales: string[],
): string {
	return comparisons
		.map((comparison) => {
			const lines = [`key: ${comparison.key}`, ""];

			for (const locale of locales) {
				const value = comparison.values[locale];

				if (value === undefined) {
					lines.push(
						`${locale} ${COLUMN_SEPARATOR} (${SYMBOLS.warning} MISSING)`,
					);
					continue;
				}

				if (value === "") {
					lines.push(`${locale} ${COLUMN_SEPARATOR}`);
					continue;
				}

				lines.push(`${locale} ${COLUMN_SEPARATOR} ${value}`);
			}

			return lines.join("\n");
		})
		.join("\n\n");
}

export function formatTranslationComparisonHeader(resource: string): string {
	return `Translation Comparison\n\n${resource}`;
}
