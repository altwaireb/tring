import { defineCommand } from "citty";

import { runCompareCommand } from "@/cli/commands/compare";
import { loadTringConfig } from "@/config";

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
			console.error(
				"Tring configuration file was not found. Run `tring init`.",
			);

			process.exitCode = 1;
			return;
		}

		const options = {
			...(args.file !== undefined && { file: args.file }),
			...(args.key !== undefined && { key: args.key }),
		};

		const command = await runCompareCommand(result.config, options);

		process.exitCode = command.exitCode;
	},
});
