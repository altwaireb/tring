import { type SortApplicationOptions, sortApplication } from "@/app";
import type { TringConfig } from "@/config";
import { formatTranslationSort } from "@/translation";

export async function runSortCommand(
	config: TringConfig,
	options: SortApplicationOptions = {},
) {
	if (options.file !== undefined && options.locale !== undefined) {
		throw new Error(
			'The "--file" option cannot be used together with "--locale".',
		);
	}

	const result = await sortApplication(config, options);

	console.log();
	console.log(formatTranslationSort(result.results));

	return {
		exitCode: 0,
		results: result.results,
	};
}
