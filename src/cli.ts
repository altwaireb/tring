import { defineCommand, runMain } from "citty";

import add from "@/commands/add";
import analyze from "@/commands/analyze";
import analyzeOnly from "@/commands/analyze-only";
import check from "@/commands/check";
import compare from "@/commands/compare";
import doctor from "@/commands/doctor";
import init from "@/commands/init";
import list from "@/commands/list";
import missing from "@/commands/missing";
import sort from "@/commands/sort";
import sync from "@/commands/sync";
import { pkg } from "./package";

export const cli = defineCommand({
	meta: {
		name: pkg.name,
		version: pkg.version,
		description: pkg.description,
	},

	subCommands: {
		add,
		analyze,
		"analyze-only": analyzeOnly,
		check,
		compare,
		doctor,
		init,
		list,
		missing,
		sort,
		sync,
	},
});

export async function run() {
	await runMain(cli);
}
