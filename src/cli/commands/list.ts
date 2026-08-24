import { type ListApplicationResult, listApplication } from "@/app";
import type { TringConfig } from "@/config";

export interface ListCommandResult {
	exitCode: number;
	result: ListApplicationResult;
}

export async function runListCommand(
	config: TringConfig,
): Promise<ListCommandResult> {
	const result = await listApplication(config);

	return {
		exitCode: 0,
		result,
	};
}
