import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"cli-entry": "src/cli-entry.ts",
	},
	format: ["esm"],
	dts: true,
	sourcemap: true,
	clean: true,
});
