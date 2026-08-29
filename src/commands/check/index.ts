import { defineCommand } from "citty";

import { runCheckCommand } from "@/cli/commands/check";
import { loadTringConfig } from "@/config";
import { logger } from "@/logger";
import { createSpinner } from "@/spinner";

import { printCheckResult } from "./output";

export default defineCommand({
	meta: {
		name: "check",
		description: "Check translation files for issues.",
		alias: "c",
	},

	args: {
		skipEmpty: {
			type: "boolean",
			description: "Skip empty translation value checks.",
			alias: "skip-empty",
			required: false,
		},

		skipSort: {
			type: "boolean",
			description: "Skip translation key sorting checks.",
			alias: "skip-sort",
			required: false,
		},

		github: {
			type: "boolean",
			description: "Format issues as GitHub workflow annotations.",
			required: false,
		},
	},

	async run({ args }) {
		const spinner = createSpinner("Checking translations...");

		spinner.start();

		const result = await loadTringConfig();

		if (!result.config) {
			spinner.fail("Tring configuration file was not found. Run `tring init`.");
			process.exitCode = 1;
			return;
		}

		try {
			const command = await runCheckCommand(result.config, {
				skipEmpty: args.skipEmpty ?? false,
				skipSort: args.skipSort ?? false,
			});

			spinner.stop();

			printCheckResult(command.issues, {
				github: args.github ?? false,
			});

			process.exitCode = command.exitCode;
		} catch (error) {
			spinner.stop();

			logger.error(error instanceof Error ? error.message : String(error));

			process.exitCode = 1;
		}
	},
});
