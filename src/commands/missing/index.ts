import { defineCommand } from "citty";

import { runMissingCommand } from "@/cli/commands/missing";
import { loadTringConfig } from "@/config";
import { logger } from "@/logger";

export default defineCommand({
	meta: {
		name: "missing",
		description: "Find missing translations.",
		alias: "m",
	},

	args: {
		empty: {
			type: "boolean",
			description: "Include empty translations.",
			required: false,
			alias: "e",
		},

		onlyEmpty: {
			type: "boolean",
			description: "Show only empty translations.",
			alias: ["only-empty", "o"],
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
			const command = await runMissingCommand(result.config, {
				...(args.empty !== undefined && { empty: args.empty }),
				...(args.onlyEmpty !== undefined && {
					onlyEmpty: args.onlyEmpty,
				}),
			});

			process.exitCode = command.exitCode;
		} catch (error) {
			logger.error(error instanceof Error ? error.message : String(error));

			process.exitCode = 1;
		}
	},
});
