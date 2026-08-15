import type { TringConfig } from "@/config";
import { TranslationLayout } from "@/config";
import { exists, join } from "@/filesystem";
import type { CheckResult } from "./result";

export async function checkTranslationLayout(
	config: TringConfig,
): Promise<CheckResult> {
	switch (config.layout) {
		case TranslationLayout.files:
			return checkFilesLayout(config);

		case TranslationLayout.directories:
			return checkDirectoriesLayout(config);
	}
}

async function checkFilesLayout(config: TringConfig): Promise<CheckResult> {
	const sourceFile = join(config.directory, `${config.source}.json`);

	if (!(await exists(sourceFile))) {
		return {
			success: false,
			message: `Source locale file does not exist: ${sourceFile}`,
		};
	}

	return {
		success: true,
		message: `Translation layout: files (${config.source}.json)`,
	};
}

async function checkDirectoriesLayout(
	config: TringConfig,
): Promise<CheckResult> {
	const sourceDirectory = join(config.directory, config.source);

	if (!(await exists(sourceDirectory))) {
		return {
			success: false,
			message: `Source locale directory does not exist: ${sourceDirectory}`,
		};
	}

	return {
		success: true,
		message: `Translation layout: directories (${config.source}/)`,
	};
}
