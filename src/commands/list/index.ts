import { defineCommand } from "citty";

import { runListCommand } from "@/cli/commands/list";
import { loadTringConfig } from "@/config";
import { createSpinner } from "@/spinner";

export default defineCommand({
	meta: {
		name: "list",
		description: "List translation resources.",
		alias: "l",
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
		const spinner = createSpinner("Loading translation resources...");

		spinner.start();

		const result = await loadTringConfig();

		if (!result.config) {
			spinner.fail("Tring configuration file was not found. Run `tring init`.");
			process.exitCode = 1;
			return;
		}

		const command = await runListCommand(result.config, {
			showFiles: args.showFiles ?? false,
		});

		spinner.stop();

		if (command.output) {
			console.log(command.output);
		}

		process.exitCode = command.exitCode;
	},
});
