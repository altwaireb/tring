import { addApplication } from "@/app";
import { TranslationLayout, type TringConfig } from "@/config";
import {
	applyTranslationAddPlan,
	type TranslationAddWriteResult,
} from "@/translation";

export interface AddCommandOptions {
	empty?: boolean;
	locale?: string;
	file?: string;
}

export interface AddCommandResult {
	exitCode: number;
	plan: Awaited<ReturnType<typeof addApplication>>["plan"];
	skippedLocales: string[];
	writeResult: TranslationAddWriteResult;
}

export async function runAddCommand(
	config: TringConfig,
	options: AddCommandOptions = {},
): Promise<AddCommandResult> {
	if (!options.locale && !options.file) {
		throw new Error('Either "--locale" or "--file" must be specified.');
	}

	if (options.locale && !config.locales.includes(options.locale)) {
		throw new Error(`The locale "${options.locale}" is not configured.`);
	}

	if (options.file && config.layout === TranslationLayout.files) {
		throw new Error(
			'The "--file" option cannot be used with the "files" translation layout.',
		);
	}

	const result = await addApplication(config, {
		...(options.locale !== undefined && {
			locale: options.locale,
		}),
		...(options.file !== undefined && {
			file: options.file,
		}),
	});

	const writeResult = await applyTranslationAddPlan(
		config,
		result.plan,
		options.empty ?? false,
	);

	return {
		exitCode: 0,
		plan: result.plan,
		skippedLocales: result.skippedLocales,
		writeResult,
	};
}
