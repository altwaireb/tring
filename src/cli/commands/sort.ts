import { type SortApplicationOptions, sortApplication } from "@/app";
import type { TringConfig } from "@/config";

export interface SortCommandResult {
	exitCode: number;
	results: Awaited<ReturnType<typeof sortApplication>>["results"];
}

export async function runSortCommand(
	config: TringConfig,
	options: SortApplicationOptions = {},
): Promise<SortCommandResult> {
	if (options.file !== undefined && options.locale !== undefined) {
		throw new Error(
			'The "--file" option cannot be used together with "--locale".',
		);
	}

	const result = await sortApplication(config, options);

	return {
		exitCode: 0,
		results: result.results,
	};
}
