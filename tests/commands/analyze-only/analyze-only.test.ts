import { runCommand } from "citty";
import { describe, expect, it } from "vitest";

import analyzeOnly from "@/commands/analyze-only";

describe("analyze-only command", () => {
	it("defines the analyze-only command", async () => {
		const meta =
			typeof analyzeOnly.meta === "function"
				? await analyzeOnly.meta()
				: await analyzeOnly.meta;

		expect(meta?.name).toBe("analyze-only");
		expect(meta?.alias).toBe("no");
	});

	it("defines locale as a required positional argument", async () => {
		const args =
			typeof analyzeOnly.args === "function"
				? await analyzeOnly.args()
				: await analyzeOnly.args;

		expect(args?.locale).toMatchObject({
			type: "positional",
			required: true,
		});
	});

	it("passes the locale positional argument to the command", async () => {
		let receivedLocale: string | undefined;

		const command = {
			...analyzeOnly,
			run: ({ args }: { args: { locale: string } }) => {
				receivedLocale = args.locale;
			},
		};

		await runCommand(command, {
			rawArgs: ["ar-SA"],
		});

		expect(receivedLocale).toBe("ar-SA");
	});
});
