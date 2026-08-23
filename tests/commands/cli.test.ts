import { describe, expect, it } from "vitest";

import { cli } from "@/cli";

describe("CLI Sub-commands", () => {
	it("registers all expected sub-commands", async () => {
		const subCommands =
			typeof cli.subCommands === "function"
				? await cli.subCommands()
				: await cli.subCommands;

		expect(subCommands).toBeDefined();

		// All Commands
		const expectedCommands = [
			"init",
			"doctor",
			"analyze",
			"analyze-only",
			"compare",
			"missing",
			"sort",
		];

		expectedCommands.forEach((cmd) => {
			expect(subCommands).toHaveProperty(cmd);
		});
	});
});
