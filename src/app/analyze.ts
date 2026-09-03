import type { TringConfig } from "@/config";
import {
	analyzeTranslations,
	createTranslationReport,
	discoverTranslationFiles,
	getTranslationFilesByLocale,
	type TranslationReport,
} from "@/translation";

export interface AnalyzeApplicationOptions {
	targetLocale?: string;
}

export interface AnalyzeApplicationResult {
	reports: TranslationReport[];
}

/** Analyzes translation files for the configured locales. */
export async function analyzeApplication(
	config: TringConfig,
	options: AnalyzeApplicationOptions = {},
): Promise<AnalyzeApplicationResult> {
	const files = await discoverTranslationFiles(config);
	const sourceFiles = getTranslationFilesByLocale(files, config.source);

	const targetLocales = options.targetLocale
		? [options.targetLocale]
		: config.locales;

	const reports: TranslationReport[] = [];

	for (const targetLocale of targetLocales) {
		const targetFiles = getTranslationFilesByLocale(files, targetLocale);

		const analysis = await analyzeTranslations(
			config.source,
			targetLocale,
			sourceFiles,
			targetFiles,
			config.keyRule,
		);

		reports.push(createTranslationReport(analysis));
	}

	return {
		reports,
	};
}
