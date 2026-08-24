export const MESSAGES = {
	title: "Translation Analysis",
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
} as const;
