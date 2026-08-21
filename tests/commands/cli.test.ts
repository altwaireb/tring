import { describe, expect, it } from "vitest";

import { cli } from "@/cli";

describe("CLI", () => {
	it("registers the expected commands", async () => {
		const subCommands =
			typeof cli.subCommands === "function"
				? await cli.subCommands()
				: await cli.subCommands;

		expect(subCommands).toBeDefined();

		expect(subCommands).toHaveProperty("init");
		expect(subCommands).toHaveProperty("doctor");
		expect(subCommands).toHaveProperty("analyze");
		expect(subCommands).toHaveProperty("analyze-only");
	});

	it("registers the compare command", async () => {
		const subCommands =
			typeof cli.subCommands === "function"
				? await cli.subCommands()
				: await cli.subCommands;

		expect(subCommands).toHaveProperty("compare");
	});

	it("registers the missing command", async () => {
		const subCommands =
			typeof cli.subCommands === "function"
				? await cli.subCommands()
				: await cli.subCommands;

		expect(subCommands).toHaveProperty("missing");
	});
});
