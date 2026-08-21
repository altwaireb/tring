import { missingApplication } from "@/app";
import type { TringConfig } from "@/config";
import { PAGE_SIZE } from "@/constants";
import { paginationPrompt } from "@/prompt";
import {
	getTranslationPage,
	type TranslationMissingIssue,
} from "@/translation";

export interface MissingCommandOptions {
	empty?: boolean;
	onlyEmpty?: boolean;
}

export async function runMissingCommand(
	config: TringConfig,
	options: MissingCommandOptions = {},
) {
	if (options.onlyEmpty && options.empty) {
		throw new Error(
			'The "--only-empty" option cannot be used together with "--empty".',
		);
	}

	const result = await missingApplication(config);

	const issues = result.issues.filter((issue) => {
		if (options.onlyEmpty) {
			return issue.isEmpty;
		}

		if (options.empty) {
			return issue.isMissing || issue.isEmpty;
		}

		return issue.isMissing;
	});

	let page = 0;

	while (true) {
		const currentPage = getTranslationPage(issues, page, PAGE_SIZE);

		console.log();

		if (page === 0) {
			console.log("Missing Translations");
			console.log();

			printIssues(currentPage.items);
		} else {
			printIssues(currentPage.items);
		}

		console.log();
		console.log(
			`Showing ${currentPage.shown} of ${currentPage.total} ${
				options.onlyEmpty ? "empty" : "missing translations"
			}`,
		);

		if (!currentPage.hasNext) {
			break;
		}

		const action = await paginationPrompt();

		if (action === "quit") {
			break;
		}

		page++;
	}

	return {
		exitCode: 0,
		issues,
	};
}

function printIssues(issues: readonly TranslationMissingIssue[]) {
	let currentResource: string | undefined;

	for (const issue of issues) {
		if (issue.resource.key !== currentResource) {
			if (currentResource !== undefined) {
				console.log();
			}

			console.log(issue.resource.key);
			console.log();

			currentResource = issue.resource.key;
		}

		const status = issue.isEmpty ? "EMPTY" : "MISSING";

		console.log(`${issue.locale} │ ${issue.key} | ${status}`);
	}
}
