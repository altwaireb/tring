import { defineCommand } from "citty";

import { runAnalyzeCommand } from "@/cli/commands/analyze";
import { loadTringConfig } from "@/config";
import { createSpinner } from "@/spinner";

export default defineCommand({
	meta: {
		name: "analyze",
		description: "Analyze all configured locales.",
		alias: "a",
	},

	args: {
		showFiles: {
			type: "boolean",
			description: "Show all translation files.",
			alias: "show-files",
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
			showFiles: args.showFiles ?? false,
		});

		spinner.stop();

		if (command.output) {
			console.log(command.output);
		}

		process.exitCode = command.exitCode;
	},
});
