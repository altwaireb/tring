import type { TringConfig } from "@/config";
import {
	analyzeTranslations,
	createTranslationReport,
	discoverTranslationFiles,
	type TranslationReport,
} from "@/translation";

export interface AnalyzeApplicationOptions {
	targetLocale?: string;
}

export interface AnalyzeApplicationResult {
	reports: TranslationReport[];
}

export async function analyzeApplication(
	config: TringConfig,
	options: AnalyzeApplicationOptions = {},
): Promise<AnalyzeApplicationResult> {
	const sourceFiles = await discoverTranslationFiles(config);

	const targetLocales = options.targetLocale
		? [options.targetLocale]
		: config.locales;

	const reports: TranslationReport[] = [];

	for (const targetLocale of targetLocales) {
		const targetFiles = sourceFiles.filter(
			(file) => file.locale === targetLocale,
		);

		const analysis = await analyzeTranslations(
			config.source,
			targetLocale,
			sourceFiles.filter((file) => file.locale === config.source),
			targetFiles,
		);

		reports.push(createTranslationReport(analysis));
	}

	return {
		reports,
	};
}
