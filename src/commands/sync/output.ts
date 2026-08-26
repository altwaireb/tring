import type { SyncCommandResult } from "@/cli/commands/sync";
import { logger } from "@/logger";

export interface PrintSyncOptions {
	empty: boolean;
}

export function printSyncResult(
	result: SyncCommandResult,
	options: PrintSyncOptions,
): void {
	const files = sortSyncFiles(result.plan.files);

	if (files.length === 0) {
		logger.text("Nothing to sync.");
		return;
	}

	const isApply = result.writeResult !== undefined;

	logger.infoMark(isApply ? "Syncing translations" : "Sync plan");
	logger.newLine();

	if (options.empty && isApply) {
		logger.warning("Empty values mode");
		logger.newLine();
	}

	for (const file of files) {
		const messages = file.changes.map(
			(change) =>
				`${change.key} = ${JSON.stringify(
					options.empty ? "" : change.sourceValue,
				)}`,
		);

		if (isApply) {
			const action = file.target === undefined ? "Created" : "Updated";

			logger.plus(`${action} ${file.displayPath}`, messages);
		} else {
			logger.plus(file.displayPath, messages);
		}

		logger.newLine();
	}

	if (isApply) {
		printApplySummary(result);
	} else {
		printDryRunSummary(result);
	}
}

function printDryRunSummary(result: SyncCommandResult): void {
	const files = result.plan.files;

	const filesCreated = files.filter((file) => file.target === undefined).length;

	const filesUpdated = files.filter((file) => file.target !== undefined).length;

	const changes = files.reduce((total, file) => total + file.changes.length, 0);

	logger.labelValue("files will be changed", files.length);

	if (filesCreated > 0) {
		logger.labelValue("files will be created", filesCreated);
	}

	if (filesUpdated > 0) {
		logger.labelValue("files will be updated", filesUpdated);
	}

	logger.labelValue("translations will be added", changes);
	logger.newLine();
}

function printApplySummary(result: SyncCommandResult): void {
	const writeResult = result.writeResult;

	if (!writeResult) {
		return;
	}

	const changes = result.plan.files.reduce(
		(total, file) => total + file.changes.length,
		0,
	);

	logger.labelValue(
		"files changed",
		writeResult.filesCreated + writeResult.filesUpdated,
	);

	if (writeResult.filesCreated > 0) {
		logger.labelValue("files created", writeResult.filesCreated);
	}

	if (writeResult.filesUpdated > 0) {
		logger.labelValue("files updated", writeResult.filesUpdated);
	}

	logger.labelValue("translations added", changes);

	logger.newLine();
	logger.successMark("Sync complete");
	logger.newLine();
}

function sortSyncFiles(
	files: SyncCommandResult["plan"]["files"],
): SyncCommandResult["plan"]["files"] {
	return [...files].sort((a, b) => {
		const aCreated = a.target === undefined;
		const bCreated = b.target === undefined;

		if (aCreated !== bCreated) {
			return aCreated ? -1 : 1;
		}

		const localeCompare = a.locale.localeCompare(b.locale);

		if (localeCompare !== 0) {
			return localeCompare;
		}

		return a.displayPath.localeCompare(b.displayPath);
	});
}
