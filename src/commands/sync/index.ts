import { defineCommand } from "citty";

import { runSyncCommand } from "@/cli/commands/sync";
import { loadTringConfig } from "@/config";
import { logger } from "@/logger";

import { printSyncResult } from "./output";

export default defineCommand({
	meta: {
		name: "sync",
		description: "Synchronize translation files.",
		alias: "y",
	},

	args: {
		dryRun: {
			type: "boolean",
			description: "Preview translation changes without modifying files.",
			alias: ["dry-run", "d"],
			required: false,
		},

		apply: {
			type: "boolean",
			description: "Apply the planned translation changes.",
			alias: "a",
			required: false,
		},

		empty: {
			type: "boolean",
			description:
				"Use empty values for missing translation keys when applying changes.",
			alias: "e",
			required: false,
		},
		locale: {
			type: "string",
			description: "Synchronize only the specified locale.",
			alias: "l",
			required: false,
		},

		file: {
			type: "string",
			description: "Synchronize only the specified translation file.",
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
			const command = await runSyncCommand(result.config, {
				...(args.dryRun !== undefined && {
					dryRun: args.dryRun,
				}),
				...(args.apply !== undefined && {
					apply: args.apply,
				}),
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

			printSyncResult(command, {
				empty: args.empty ?? false,
			});

			process.exitCode = command.exitCode;
		} catch (error) {
			logger.error(error instanceof Error ? error.message : String(error));
			process.exitCode = 1;
		}
	},
});
