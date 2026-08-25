import { missingApplication } from "@/app";
import {
	printMissingHeader,
	printMissingIssues,
	printMissingPagination,
} from "@/commands/missing/output";
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

export interface MissingCommandResult {
	exitCode: number;
	issues: TranslationMissingIssue[];
}

export async function runMissingCommand(
	config: TringConfig,
	options: MissingCommandOptions = {},
): Promise<MissingCommandResult> {
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

		if (page === 0) {
			printMissingHeader();
		}

		printMissingIssues(currentPage.items);

		const label = options.onlyEmpty ? "empty" : "missing translations";

		printMissingPagination(currentPage.shown, currentPage.total, label);

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
