import { type SyncApplicationResult, syncApplication } from "@/app";
import type { TringConfig } from "@/config";
import {
	applyTranslationSyncPlan,
	type TranslationSyncWriteResult,
} from "@/translation";

export interface SyncCommandOptions {
	dryRun?: boolean;
	apply?: boolean;
	empty?: boolean;
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

	const result = await syncApplication(config);

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
