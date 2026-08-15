import { analyzeApplication } from "@/app";
import type { TringConfig } from "@/config";
import { formatTranslationReport } from "@/translation";

export interface AnalyzeCommandOptions {
	targetLocale?: string;
	showFiles?: boolean;
}

export interface CommandResult {
	exitCode: number;
	output: string;
}

export async function runAnalyzeCommand(
	config: TringConfig,
	options: AnalyzeCommandOptions = {},
): Promise<CommandResult> {
	if (options.targetLocale && !config.locales.includes(options.targetLocale)) {
		return {
			exitCode: 1,
			output: `Locale "${options.targetLocale}" is not configured. tring.config.ts`,
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

	const output = result.reports
		.map((report) =>
			formatTranslationReport(report, {
				showFiles: options.showFiles ?? false,
			}),
		)
		.join("\n\n");

	return {
		exitCode: hasProblems ? 1 : 0,
		output,
	};
}
