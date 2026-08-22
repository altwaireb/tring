import { defineCommand } from "citty";

import { runSortCommand } from "@/cli/commands/sort";
import { loadTringConfig } from "@/config";

export default defineCommand({
	meta: {
		name: "sort",
		description: "Sort translation keys alphabetically.",
		alias: "s",
	},

	args: {
		file: {
			type: "string",
			description:
				"Translation file path starting with the locale (e.g. en-US/admin/roles.json).",
			alias: "f",
		},

		locale: {
			type: "string",
			description: "Sort translation files for a specific locale.",
			alias: "l",
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

		if (args.file !== undefined && args.locale !== undefined) {
			console.error(
				"The `--file` and `--locale` options cannot be used together.",
			);

			process.exitCode = 1;
			return;
		}

		try {
			const command = await runSortCommand(result.config, {
				...(args.file !== undefined && { file: args.file }),
				...(args.locale !== undefined && { locale: args.locale }),
			});

			process.exitCode = command.exitCode;
		} catch (error) {
			console.error(error instanceof Error ? error.message : String(error));

			process.exitCode = 1;
		}
	},
});
