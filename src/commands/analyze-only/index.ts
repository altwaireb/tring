import { defineCommand } from "citty";

import { runAnalyzeCommand } from "@/cli/commands/analyze";
import { printAnalyzeReports } from "@/commands/analyze/output";
import { loadTringConfig } from "@/config";
import { logger } from "@/logger";
import { MESSAGES } from "@/messages";
import { createSpinner } from "@/spinner";

export default defineCommand({
	meta: {
		name: "analyze-only",
		description: "Analyze a specific locale.",
		alias: "ao",
	},

	args: {
		locale: {
			type: "positional",
			description: "The locale to analyze.",
			alias: "l",
			required: true,
		},

		showFiles: {
			type: "boolean",
			description: "Show all translation files.",
			alias: ["show-files", "f"],
			required: false,
		},
	},

	async run({ args }) {
		const spinner = createSpinner("Analyzing translations...");

		spinner.start();

		const result = await loadTringConfig();

		if (!result.config) {
			spinner.fail("Tring configuration file was not found. Run `tring init`.");
			process.exitCode = 1;
			return;
		}

		const command = await runAnalyzeCommand(result.config, {
			targetLocale: args.locale,
		});

		spinner.stop();

		if (command.error) {
			logger.error(MESSAGES.localeNotConfigured(command.error.targetLocale));
			process.exitCode = command.exitCode;
			return;
		}

		if (command.reports.length > 0) {
			printAnalyzeReports(command.reports, {
				showFiles: args.showFiles ?? false,
			});
		}

		process.exitCode = command.exitCode;
	},
});
