import { SYMBOLS } from "@/constants";
import type { TranslationReport } from "./report";

export interface FormatTranslationReportOptions {
	showFiles?: boolean;
}

export function formatTranslationReport(
	report: TranslationReport,
	options: FormatTranslationReportOptions = {},
): string {
	const lines: string[] = [
		"Translation Analysis",
		"",
		`Source: ${report.source}`,
		`Target: ${report.target}`,
	];

	if (options.showFiles && report.files.matched.length > 0) {
		lines.push("", "Files");

		for (const file of report.files.matched) {
			lines.push(
				`  ${SYMBOLS.success} ${file.source.key} | ${file.source.locale}`,
			);
		}
	}

	if (report.files.missing.length > 0) {
		lines.push("", "Files Missing");

		for (const file of report.files.missing) {
			lines.push(`  ${SYMBOLS.error} ${file.key} | ${file.locale}`);
		}
	}

	if (report.files.extra.length > 0) {
		lines.push("", "Files Extra");

		for (const file of report.files.extra) {
			lines.push(`  ${SYMBOLS.bullet} ${file.key} | ${file.locale}`);
		}
	}

	if (report.keys.missing.length > 0) {
		lines.push("", "Keys Missing");

		for (const issue of report.keys.missing) {
			lines.push(
				`  ${SYMBOLS.error} ${issue.key} | ${issue.locale} | ${issue.fileKey}`,
			);
		}
	}

	if (report.keys.extra.length > 0) {
		lines.push("", "Extra Keys");

		for (const issue of report.keys.extra) {
			lines.push(
				`  ${SYMBOLS.bullet} ${issue.key} | ${issue.locale} | ${issue.fileKey}`,
			);
		}
	}

	lines.push(
		"",
		"Summary",
		`  Files missing: ${report.summary.filesMissing}`,
		`  Files extra: ${report.summary.filesExtra}`,
		`  Keys missing: ${report.summary.keysMissing}`,
		`  Extra keys: ${report.summary.extraKeys}`,
	);

	return lines.join("\n");
}
