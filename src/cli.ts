import { defineCommand, runMain } from "citty";

import analyze from "@/commands/analyze";
import analyzeOnly from "@/commands/analyze-only";
import doctor from "@/commands/doctor";
import init from "@/commands/init";
import list from "@/commands/list";
import { pkg } from "./package";

export const cli = defineCommand({
	meta: {
		name: pkg.name,
		version: pkg.version,
		description: pkg.description,
	},

	subCommands: {
		init,
		doctor,
		list,
		analyze,
		"analyze-only": analyzeOnly,
	},
});

export async function run() {
	await runMain(cli);
}
