import { Gap, Indent, logger } from "@/logger";
import { MESSAGES } from "@/messages";
import type { TranslationMissingIssue } from "@/translation";

export function printMissingHeader(): void {
	logger.text(MESSAGES.missingTitle, {
		bold: true,
	});

	logger.newLine();
}

export function printMissingIssues(
	issues: readonly TranslationMissingIssue[],
): void {
	let currentResource: string | undefined;

	for (const issue of issues) {
		if (issue.resource.key !== currentResource) {
			if (currentResource !== undefined) {
				logger.newLine();
			}

			logger.text(issue.resource.key, {
				bold: true,
			});

			logger.newLine();

			currentResource = issue.resource.key;
		}

		if (issue.isEmpty) {
			logger.separateWarningMark(issue.locale, `${issue.key} | EMPTY`, {
				indent: Indent.level1,
				gap: Gap.level1,
			});

			continue;
		}

		logger.separate(issue.locale, `${issue.key} | MISSING`, {
			indent: Indent.level1,
			gap: Gap.level1,
		});
	}
}

export function printMissingPagination(
	shown: number,
	total: number,
	label: string,
): void {
	logger.newLine();
	logger.text(`Showing ${shown} of ${total} ${label}`);
}
