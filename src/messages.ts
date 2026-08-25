export const MESSAGES = {
	titleAnalysis: "Translation Analysis",
	translationResources: "Translation Resources",

	source: "Source",
	target: "Target",

	files: "Files",
	filesMissing: "Files Missing",
	filesExtra: "Files Extra",

	keysMissing: "Keys Missing",
	extraKeys: "Extra Keys",

	summary: "Summary",
	filesMissingSummary: "Files missing",
	filesExtraSummary: "Files extra",
	keysMissingSummary: "Keys missing",
	extraKeysSummary: "Extra keys",

	localeNotConfigured: (locale: string): string =>
		`Locale "${locale}" is not configured. tring.config.ts`,

	sortTitle: "Translation Sort",
	sortAllSorted: "All translation files are already sorted.",
	sortSorted: (count: number): string =>
		`Sorted ${count} translation file${count === 1 ? "" : "s"}.`,
	sortModified: "Modified",

	compareTitle: "Translation Comparison",
	missingTitle: "Missing Translations",
} as const;
