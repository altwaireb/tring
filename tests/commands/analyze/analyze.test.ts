import { runCommand } from "citty";
import { describe, expect, it } from "vitest";

import analyze from "@/commands/analyze";

describe("analyze command", () => {
	it("defines the analyze command", async () => {
		const meta =
			typeof analyze.meta === "function"
				? await analyze.meta()
				: await analyze.meta;

		expect(meta?.name).toBe("analyze");
		expect(meta?.alias).toBe("n");
	});

	it("accepts the analyze alias", async () => {
		const command = {
			...analyze,
			run: ({ rawArgs }: { rawArgs: string[] }) => rawArgs,
		};

		const result = await runCommand(command, {
			rawArgs: [],
		});

		expect(result.result).toEqual([]);
	});
});
