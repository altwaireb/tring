import { type CheckApplicationOptions, checkApplication } from "@/app";
import type { TringConfig } from "@/config";

export interface CheckCommandResult {
	exitCode: number;
	issues: Awaited<ReturnType<typeof checkApplication>>["issues"];
}

export async function runCheckCommand(
	config: TringConfig,
	options: CheckApplicationOptions = {},
): Promise<CheckCommandResult> {
	const result = await checkApplication(config, options);

	return {
		exitCode: result.exitCode,
		issues: result.issues,
	};
}
