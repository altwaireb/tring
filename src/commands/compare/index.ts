import { defineCommand } from "citty";

import { runCompareCommand } from "@/cli/commands/compare";
import { loadTringConfig } from "@/config";
import { PAGE_SIZE } from "@/constants";
import { logger } from "@/logger";
import { paginationPrompt } from "@/prompt";
import { getTranslationPage } from "@/translation";

import {
	printCompareHeader,
	printComparePagination,
	printTranslationComparisons,
} from "./output";

export default defineCommand({
	meta: {
		name: "compare",
		description: "Compare translation resources.",
		alias: "c",
	},

	args: {
		file: {
			type: "string",
			description: "Translation resource file to compare.",
			alias: "f",
		},

		key: {
			type: "string",
			description: "Translation key to compare.",
			alias: "k",
		},
	},

	async run({ args }) {
		const result = await loadTringConfig();

		if (!result.config) {
			logger.error("Tring configuration file was not found. Run `tring init`.");

			process.exitCode = 1;
			return;
		}

		const options = {
			...(args.file !== undefined && { file: args.file }),
			...(args.key !== undefined && { key: args.key }),
		};

		try {
			const command = await runCompareCommand(result.config, options);

			let page = 0;

			while (true) {
				const currentPage = getTranslationPage(
					command.comparisons,
					page,
					PAGE_SIZE,
				);

				if (page === 0) {
					printCompareHeader(command.resource.key);
				}

				printTranslationComparisons(currentPage.items, command.locales);

				printComparePagination(currentPage.shown, currentPage.total);

				if (!currentPage.hasNext) {
					break;
				}

				const action = await paginationPrompt();

				if (action === "quit") {
					break;
				}

				page++;
			}

			process.exitCode = command.exitCode;
		} catch (error) {
			logger.error(error instanceof Error ? error.message : String(error));

			process.exitCode = 1;
		}
	},
});
