import { addApplication } from "@/app";
import {
	addLocaleToConfig,
	hasLocaleInConfig,
	TranslationLayout,
	type TringConfig,
} from "@/config";
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

	if (options.locale && options.file) {
		throw new Error(
			'The "--locale" and "--file" options cannot be used together.',
		);
	}

	if (options.file && config.layout === TranslationLayout.files) {
		throw new Error(
			'The "--file" option cannot be used with the "files" translation layout.',
		);
	}

	let effectiveConfig = config;

	if (options.locale && !(await hasLocaleInConfig(options.locale))) {
		await addLocaleToConfig(options.locale);

		effectiveConfig = {
			...config,
			locales: [...config.locales, options.locale],
		};
	}

	const result = await addApplication(effectiveConfig, {
		...(options.locale !== undefined && {
			locale: options.locale,
		}),
		...(options.file !== undefined && {
			file: options.file,
		}),
	});

	const writeResult = await applyTranslationAddPlan(
		effectiveConfig,
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
