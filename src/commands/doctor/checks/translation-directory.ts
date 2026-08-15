import type { TringConfig } from "@/config";
import { exists, join } from "@/filesystem";
import type { CheckResult } from "./result";

export async function checkTranslationDirectory(
	config: TringConfig,
): Promise<CheckResult> {
	const directory = join(process.cwd(), config.directory);

	if (!(await exists(directory))) {
		return {
			success: false,
			message: `Translation directory does not exist: ${config.directory}`,
		};
	}

	return {
		success: true,
		message: `Translation directory found: ${config.directory}`,
	};
}
