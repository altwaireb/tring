import { defineCommand } from "citty";

import { runDoctor } from "./action";

export default defineCommand({
	meta: {
		name: "doctor",
		description: "Check your Tring project.",
		alias: "d",
	},

	async run() {
		const success = await runDoctor();

		if (!success) {
			process.exitCode = 1;
		}
	},
});
