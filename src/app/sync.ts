import { TranslationLayout, type TringConfig } from "@/config";
import { join } from "@/filesystem";
import {
	createTranslationSyncPlan,
	discoverTranslationFiles,
	getTranslationFilesByLocale,
	readTranslationFile,
	type TranslationDocument,
	type TranslationFile,
	type TranslationSyncWriteFile,
	type TranslationSyncWritePlan,
} from "@/translation";

export interface SyncApplicationResult {
	plan: TranslationSyncWritePlan;
}

export interface SyncApplicationOptions {
	locale?: string;
	file?: string;
}

export async function syncApplication(
	config: TringConfig,
	options: SyncApplicationOptions = {},
): Promise<SyncApplicationResult> {
	const files = await discoverTranslationFiles(config);

	const sourceFiles = getTranslationFilesByLocale(files, config.source)
		.filter((file) => options.file === undefined || file.key === options.file)
		.sort((a, b) => a.key.localeCompare(b.key));

	const locales = options.locale ? [options.locale] : config.locales;

	const targetFiles = files.filter((file) => locales.includes(file.locale));

	const sourceDocuments = await Promise.all(
		sourceFiles.map((file) => readTranslationFile(file)),
	);

	const targetDocuments = await Promise.all(
		targetFiles.map((file) => readTranslationFile(file)),
	);

	const planFiles: TranslationSyncWriteFile[] = [];

	for (const sourceDocument of sourceDocuments) {
		const sourceTargetDocuments = getTargetDocuments(
			config,
			sourceDocument.file,
			targetDocuments,
		);

		const plan = createTranslationSyncPlan(
			sourceDocument,
			sourceTargetDocuments,
			locales,
		);

		for (const file of plan.files) {
			planFiles.push({
				...file,
				targetPath:
					file.target?.path ?? getTargetPath(config, file.source, file.locale),
				displayPath: getDisplayPath(config, file.source, file.locale),
			});
		}
	}

	return {
		plan: {
			files: planFiles,
		},
	};
}

function getTargetDocuments(
	config: TringConfig,
	sourceFile: TranslationFile,
	targets: TranslationDocument[],
): TranslationDocument[] {
	switch (config.layout) {
		case TranslationLayout.files:
			return targets;

		case TranslationLayout.directories:
			return targets.filter((document) => document.file.key === sourceFile.key);
	}
}

function getTargetPath(
	config: TringConfig,
	sourceFile: TranslationFile,
	locale: string,
): string {
	switch (config.layout) {
		case TranslationLayout.files:
			return join(config.directory, `${locale}.json`);

		case TranslationLayout.directories:
			return join(config.directory, locale, sourceFile.key);
	}
}

function getDisplayPath(
	config: TringConfig,
	sourceFile: TranslationFile,
	locale: string,
): string {
	switch (config.layout) {
		case TranslationLayout.files:
			return `${locale}.json`;

		case TranslationLayout.directories:
			return `${locale}/${sourceFile.key}`;
	}
}
