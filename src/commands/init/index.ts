import { defineCommand } from "citty";

import { runInit } from "./action";

export default defineCommand({
	meta: {
		name: "init",
		description: "Create a new Tring configuration file.",
		alias: "i",
	},

	args: {
		force: {
			type: "boolean",
			description: "Overwrite the existing configuration file.",
			required: false,
		},
	},

	async run({ args }) {
		await runInit({
			force: args.force ?? false,
		});
	},
});
