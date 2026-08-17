import { listApplication } from "@/app";
import type { TringConfig } from "@/config";
import { formatTranslationResources } from "@/translation";

export interface ListCommandOptions {
	showFiles?: boolean;
}

export async function runListCommand(
	config: TringConfig,
	options: ListCommandOptions = {},
) {
	const result = await listApplication(config);

	return {
		exitCode: 0,
		output: formatTranslationResources(result, {
			showFiles: options.showFiles ?? false,
		}),
	};
}
