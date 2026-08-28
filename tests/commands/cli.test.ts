import { describe, expect, it } from "vitest";

import { cli } from "@/cli";

describe("CLI Sub-commands", () => {
	it("registers all expected sub-commands", async () => {
		const subCommands =
			typeof cli.subCommands === "function"
				? await cli.subCommands()
				: await cli.subCommands;

		expect(subCommands).toBeDefined();

		const expectedCommands = [
			"add",
			"analyze",
			"analyze-only",
			"check",
			"compare",
			"doctor",
			"init",
			"list",
			"missing",
			"sort",
			"sync",
		];

		expectedCommands.forEach((command) => {
			expect(subCommands).toHaveProperty(command);
		});
	});
});
