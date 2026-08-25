import { defineCommand } from "citty";

import { runDoctor } from "./action";
import { printDoctorResult } from "./output";

export default defineCommand({
	meta: {
		name: "doctor",
		description: "Check your Tring project setup.",
		alias: "d",
	},

	async run() {
		const result = await runDoctor();

		printDoctorResult(result);

		if (!result.success) {
			process.exitCode = 1;
		}
	},
});
