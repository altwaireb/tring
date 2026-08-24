import { analyzeApplication } from "@/app";
import type { TringConfig } from "@/config";
import type { TranslationReport } from "@/translation";

export interface AnalyzeCommandOptions {
	targetLocale?: string;
}

export interface AnalyzeCommandResult {
	exitCode: number;
	reports: TranslationReport[];
	error?: {
		targetLocale: string;
	};
}

export async function runAnalyzeCommand(
	config: TringConfig,
	options: AnalyzeCommandOptions = {},
): Promise<AnalyzeCommandResult> {
	if (options.targetLocale && !config.locales.includes(options.targetLocale)) {
		return {
			exitCode: 1,
			reports: [],
			error: {
				targetLocale: options.targetLocale,
			},
		};
	}

	const result = await analyzeApplication(config, {
		...(options.targetLocale !== undefined
			? { targetLocale: options.targetLocale }
			: {}),
	});

	const hasProblems = result.reports.some(
		(report) =>
			report.summary.filesMissing > 0 ||
			report.summary.filesExtra > 0 ||
			report.summary.keysMissing > 0 ||
			report.summary.extraKeys > 0,
	);

	return {
		exitCode: hasProblems ? 1 : 0,
		reports: result.reports,
	};
}
