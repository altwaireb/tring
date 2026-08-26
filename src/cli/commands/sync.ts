import { type SyncApplicationResult, syncApplication } from "@/app";
import { TranslationLayout, type TringConfig } from "@/config";
import {
	applyTranslationSyncPlan,
	type TranslationSyncWriteResult,
} from "@/translation";

export interface SyncCommandOptions {
	dryRun?: boolean;
	apply?: boolean;
	empty?: boolean;
	locale?: string;
	file?: string;
}

export interface SyncCommandResult {
	exitCode: number;
	plan: SyncApplicationResult["plan"];
	writeResult?: TranslationSyncWriteResult;
}

export async function runSyncCommand(
	config: TringConfig,
	options: SyncCommandOptions = {},
): Promise<SyncCommandResult> {
	if (options.dryRun && options.apply) {
		throw new Error(
			'The "--dry-run" and "--apply" options cannot be used together.',
		);
	}

	if (options.dryRun && options.empty) {
		throw new Error(
			'The "--dry-run" and "--empty" options cannot be used together.',
		);
	}

	if (options.empty && !options.apply) {
		throw new Error('The "--empty" option requires "--apply".');
	}

	if (options.locale && !config.locales.includes(options.locale)) {
		throw new Error(`The locale "${options.locale}" is not configured.`);
	}

	if (options.file && config.layout === TranslationLayout.files) {
		throw new Error(
			'The "--file" option cannot be used with the "files" translation layout.',
		);
	}

	const result =
		options.locale === undefined && options.file === undefined
			? await syncApplication(config)
			: await syncApplication(config, {
					...(options.locale !== undefined && {
						locale: options.locale,
					}),
					...(options.file !== undefined && {
						file: options.file,
					}),
				});

	if (!options.apply) {
		return {
			exitCode: 0,
			plan: result.plan,
		};
	}

	const writeResult = await applyTranslationSyncPlan(
		config,
		result.plan,
		options.empty ?? false,
	);

	return {
		exitCode: 0,
		plan: result.plan,
		writeResult,
	};
}
