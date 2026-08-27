import { defineCommand } from "citty";

import { runAddCommand } from "@/cli/commands/add";
import { loadTringConfig } from "@/config";
import { logger } from "@/logger";
import { printAddResult } from "./output";

export default defineCommand({
	meta: {
		name: "add",
		description: "Add missing translation keys.",
		alias: "a",
	},

	args: {
		empty: {
			type: "boolean",
			description: "Use empty values for missing translation keys.",
			alias: "e",
			required: false,
		},

		locale: {
			type: "string",
			description:
				"Add missing translation keys only for the specified locale.",
			alias: "l",
			required: false,
		},

		file: {
			type: "string",
			description:
				"Add the specified translation file to all configured locales.",
			alias: "f",
			required: false,
		},
	},

	async run({ args }) {
		const result = await loadTringConfig();

		if (!result.config) {
			logger.error("Tring configuration file was not found. Run `tring init`.");
			process.exitCode = 1;
			return;
		}

		try {
			const command = await runAddCommand(result.config, {
				...(args.empty !== undefined && {
					empty: args.empty,
				}),
				...(args.locale !== undefined && {
					locale: args.locale,
				}),
				...(args.file !== undefined && {
					file: args.file,
				}),
			});

			printAddResult(command, {
				empty: args.empty ?? false,
				...(args.file !== undefined && {
					file: args.file,
				}),
			});

			process.exitCode = command.exitCode;
		} catch (error) {
			logger.error(error instanceof Error ? error.message : String(error));
			process.exitCode = 1;
		}
	},
});
