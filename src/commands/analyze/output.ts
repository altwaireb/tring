import { Gap, Indent, logger } from "@/logger";
import { MESSAGES } from "@/messages";
import type { TranslationReport } from "@/translation";

export interface PrintAnalyzeReportsOptions {
	showFiles?: boolean;
}

function printSummary(report: TranslationReport): void {
	const SUMMARY_LABEL_WIDTH = 26;

	logger.text(MESSAGES.summary, {
		bold: true,
	});

	logger.labelValue(
		MESSAGES.filesMissingSummary,
		report.summary.filesMissing,
		{
			indent: Indent.level1,
		},
		SUMMARY_LABEL_WIDTH,
	);

	logger.labelValue(
		MESSAGES.filesExtraSummary,
		report.summary.filesExtra,
		{
			indent: Indent.level1,
		},
		SUMMARY_LABEL_WIDTH,
	);

	logger.labelValue(
		MESSAGES.keysMissingSummary,
		report.summary.keysMissing,
		{
			indent: Indent.level1,
		},
		SUMMARY_LABEL_WIDTH,
	);

	logger.labelValue(
		MESSAGES.extraKeysSummary,
		report.summary.extraKeys,
		{
			indent: Indent.level1,
		},
		SUMMARY_LABEL_WIDTH,
	);
}

function printFiles(report: TranslationReport, showFiles: boolean): void {
	if (showFiles && report.files.matched.length > 0) {
		logger.text(MESSAGES.files, {
			bold: true,
		});

		for (const file of report.files.matched) {
			logger.separateSuccessMark(file.source.key, file.source.locale, {
				indent: Indent.level1,
			});
		}
	}

	if (report.files.missing.length > 0) {
		logger.text(MESSAGES.filesMissing, {
			bold: true,
		});

		for (const file of report.files.missing) {
			logger.separateErrorMark(file.key, file.locale, {
				indent: Indent.level1,
			});
		}
	}

	if (report.files.extra.length > 0) {
		logger.text(MESSAGES.filesExtra, {
			bold: true,
		});

		for (const file of report.files.extra) {
			logger.bullet(file.key, file.locale, {
				indent: Indent.level1,
			});
		}
	}
}

function printKeys(report: TranslationReport): void {
	if (report.keys.missing.length > 0) {
		logger.text(MESSAGES.keysMissing, {
			bold: true,
		});

		for (const issue of report.keys.missing) {
			logger.separateErrorMark(issue.key, [issue.locale, issue.fileKey], {
				indent: Indent.level1,
			});
		}
	}

	if (report.keys.extra.length > 0) {
		logger.text(MESSAGES.extraKeys, {
			bold: true,
		});

		for (const issue of report.keys.extra) {
			logger.bullet(issue.key, [issue.locale, issue.fileKey], {
				indent: Indent.level1,
			});
		}
	}
}

export function printAnalyzeReport(
	report: TranslationReport,
	options: PrintAnalyzeReportsOptions = {},
): void {
	const showFiles = options.showFiles ?? false;

	logger.text(MESSAGES.titleAnalysis, {
		bold: true,
	});

	logger.separate(MESSAGES.source, report.source, {
		gap: Gap.level1,
	});

	logger.separate(MESSAGES.target, report.target, {
		gap: Gap.level1,
	});

	logger.newLine();

	printFiles(report, showFiles);

	if (
		(showFiles && report.files.matched.length > 0) ||
		report.files.missing.length > 0 ||
		report.files.extra.length > 0
	) {
		logger.newLine();
	}

	printKeys(report);

	if (report.keys.missing.length > 0 || report.keys.extra.length > 0) {
		logger.newLine();
	}

	printSummary(report);
}

export function printAnalyzeReports(
	reports: TranslationReport[],
	options: PrintAnalyzeReportsOptions = {},
): void {
	reports.forEach((report, index) => {
		if (index > 0) {
			logger.newLine();
			logger.newLine();
		}

		printAnalyzeReport(report, options);
	});
}
