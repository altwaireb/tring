import type { AddCommandResult } from "@/cli/commands/add";
import { logger } from "@/logger";

export interface PrintAddOptions {
	empty: boolean;
	file?: string;
}

export function printAddResult(
	result: AddCommandResult,
	options: PrintAddOptions,
): void {
	if (options.file !== undefined) {
		printAddFileResult(result, options);
		return;
	}

	printAddLocaleResult(result, options);
}

function printAddFileResult(
	result: AddCommandResult,
	options: PrintAddOptions,
): void {
	const addedLocales = [
		...new Set(result.plan.files.map((file) => file.locale)),
	].sort((a, b) => a.localeCompare(b));

	const skippedLocales = [...result.skippedLocales].sort((a, b) =>
		a.localeCompare(b),
	);

	if (addedLocales.length === 0 && skippedLocales.length === 0) {
		logger.text("Nothing to add.");
		return;
	}

	if (addedLocales.length > 0) {
		logger.successMark(`Added "${options.file}"`);

		for (const locale of addedLocales) {
			logger.plusMark(locale, { indent: 5 });
		}

		logger.newLine();
	}

	if (skippedLocales.length > 0) {
		logger.warningMark("Skipped where the file already contains all keys", {
			indent: 2,
		});

		for (const locale of skippedLocales) {
			logger.bulletMark(locale, { indent: 5 });
		}

		logger.newLine();
	}

	if (options.empty) {
		logger.warning("Empty values mode");
		logger.newLine();
	}

	printAddSummary(result, result.plan.files.length);

	logger.newLine();
	logger.successMark("Add complete");
	logger.newLine();
}

function printAddLocaleResult(
	result: AddCommandResult,
	options: PrintAddOptions,
): void {
	const files = [...result.plan.files].sort((a, b) => {
		const aCreated = a.target === undefined;
		const bCreated = b.target === undefined;

		if (aCreated !== bCreated) {
			return aCreated ? -1 : 1;
		}

		return a.displayPath.localeCompare(b.displayPath);
	});

	if (files.length === 0) {
		logger.text("Nothing to add.");
		return;
	}

	logger.infoMark("Adding translations");
	logger.newLine();

	if (options.empty) {
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

		const action = file.target === undefined ? "Created" : "Updated";

		logger.plus(`${action} ${file.displayPath}`, messages);
		logger.newLine();
	}

	printAddSummary(result, files.length);

	logger.newLine();
	logger.successMark("Add complete");
	logger.newLine();
}

function printAddSummary(result: AddCommandResult, filesChanged: number): void {
	const changes = result.plan.files.reduce(
		(total, file) => total + file.changes.length,
		0,
	);

	logger.labelValue("files changed", filesChanged);

	if (result.writeResult.filesCreated > 0) {
		logger.labelValue("files created", result.writeResult.filesCreated);
	}

	if (result.writeResult.filesUpdated > 0) {
		logger.labelValue("files updated", result.writeResult.filesUpdated);
	}

	logger.labelValue("translations added", changes);
}
