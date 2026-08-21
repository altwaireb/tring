import type { TranslationMissingIssue } from "./missing";

export function formatTranslationMissingIssues(
	issues: readonly TranslationMissingIssue[],
): string {
	return issues
		.map((issue) => {
			const status = issue.isEmpty ? "EMPTY" : "MISSING";

			return `${issue.locale} │ ${issue.key} | ${status}`;
		})
		.join("\n");
}
