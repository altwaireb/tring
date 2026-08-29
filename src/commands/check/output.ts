import type { TranslationCheckIssue, TranslationCheckIssueType } from "@/app";
import { Gap, Indent, logger } from "@/logger";

const ISSUE_LABELS: Record<TranslationCheckIssueType, string> = {
	"missing-file": "Missing files",
	"extra-file": "Extra files",
	"missing-key": "Missing keys",
	"extra-key": "Extra keys",
	"empty-value": "Empty values",
	unsorted: "Unsorted",
};

const ISSUE_TYPES: TranslationCheckIssueType[] = [
	"missing-file",
	"extra-file",
	"missing-key",
	"extra-key",
	"empty-value",
	"unsorted",
];

export interface PrintCheckOptions {
	github?: boolean;
}

function printIssueSummary(issues: readonly TranslationCheckIssue[]): void {
	const counts = new Map<TranslationCheckIssueType, number>();

	for (const issue of issues) {
		counts.set(issue.type, (counts.get(issue.type) ?? 0) + 1);
	}

	for (const type of ISSUE_TYPES) {
		logger.labelValue(ISSUE_LABELS[type], String(counts.get(type) ?? 0), {
			indent: Indent.level1,
		});
	}
}

function printIssue(issue: TranslationCheckIssue): void {
	const messages =
		issue.key !== undefined ? [issue.file, issue.key] : issue.file;

	if (issue.type === "empty-value") {
		logger.separateWarningMark(issue.locale, messages, {
			indent: Indent.level1,
			gap: Gap.level1,
		});

		return;
	}

	logger.separateErrorMark(issue.locale, messages, {
		indent: Indent.level1,
		gap: Gap.level1,
	});
}

function printIssueGroup(
	issues: readonly TranslationCheckIssue[],
	type: TranslationCheckIssueType,
): boolean {
	const group = issues.filter((issue) => issue.type === type);

	if (group.length === 0) {
		return false;
	}

	logger.text(ISSUE_LABELS[type], {
		bold: true,
	});

	logger.newLine();

	for (const issue of group) {
		printIssue(issue);
	}

	return true;
}

function printCheckGitHubResult(
	issues: readonly TranslationCheckIssue[],
): void {
	for (const issue of issues) {
		if (issue.type === "empty-value") {
			logger.githubWarning(issue.message, {
				file: issue.path,
				title: issue.title,
			});

			continue;
		}

		logger.githubError(issue.message, {
			file: issue.path,
			title: issue.title,
		});
	}
}

export function printCheckResult(
	issues: readonly TranslationCheckIssue[],
	options: PrintCheckOptions = {},
): void {
	if (options.github) {
		printCheckGitHubResult(issues);
		return;
	}

	if (issues.length === 0) {
		logger.successMark("Translation check passed");
		return;
	}

	logger.errorMark(`Translation check found ${issues.length} issues`);

	logger.newLine();

	printIssueSummary(issues);

	logger.newLine();

	let printedGroup = false;

	for (const type of ISSUE_TYPES) {
		const printed = printIssueGroup(issues, type);

		if (printed && printedGroup) {
			logger.newLine();
		}

		if (printed) {
			printedGroup = true;
		}
	}
}
