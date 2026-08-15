import { defineCommand } from "citty";

import { runAnalyzeCommand } from "@/cli/commands/analyze";
import { loadTringConfig } from "@/config";
import { log } from "@/logger";

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
			required: true,
		},

		showFiles: {
			type: "boolean",
			description: "Show all translation files.",
			alias: "show-files",
			required: false,
		},
	},

	async run({ args }) {
		const result = await loadTringConfig();

		if (!result.config) {
			log.error("Tring configuration file was not found. Run `tring init`.");
			process.exitCode = 1;
			return;
		}

		const command = await runAnalyzeCommand(result.config, {
			targetLocale: args.locale,
			showFiles: args.showFiles ?? false,
		});

		if (command.output) {
			console.log(command.output);
		}

		process.exitCode = command.exitCode;
	},
});
