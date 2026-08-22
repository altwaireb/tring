import { defineCommand, runMain } from "citty";

import analyze from "@/commands/analyze";
import analyzeOnly from "@/commands/analyze-only";
import compare from "@/commands/compare";
import doctor from "@/commands/doctor";
import init from "@/commands/init";
import list from "@/commands/list";
import missing from "@/commands/missing";
import sort from "@/commands/sort";
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
		compare,
		sort,
		missing,
		analyze,
		"analyze-only": analyzeOnly,
	},
});

export async function run() {
	await runMain(cli);
}
