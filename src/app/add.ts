import { TranslationLayout, type TringConfig } from "@/config";
import { join } from "@/filesystem";
import {
	createTranslationAddPlan,
	discoverTranslationFiles,
	getTranslationFilesByLocale,
	readTranslationFile,
	type TranslationAddWritePlan,
	type TranslationDocument,
	type TranslationFile,
} from "@/translation";

export interface AddApplicationResult {
	plan: TranslationAddWritePlan;
	skippedLocales: string[];
}

export interface AddApplicationOptions {
	locale?: string;
	file?: string;
}

/** Creates a plan for adding missing translation keys. */
export async function addApplication(
	config: TringConfig,
	options: AddApplicationOptions,
): Promise<AddApplicationResult> {
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

	const planFiles: TranslationAddWritePlan["files"] = [];
	const skippedLocales: string[] = [];

	for (const locale of locales) {
		let localeHasChanges = false;

		const localeTargets = targetDocuments.filter(
			(document) => document.file.locale === locale,
		);

		for (const sourceDocument of sourceDocuments) {
			const targetDocument = getTargetDocument(
				config,
				sourceDocument.file,
				localeTargets,
			);

			const plan = createTranslationAddPlan(
				sourceDocument,
				targetDocument,
				locale,
			);

			if (plan.files.length === 0) {
				continue;
			}

			localeHasChanges = true;

			for (const file of plan.files) {
				planFiles.push({
					...file,
					targetPath:
						file.target?.path ??
						getTargetPath(config, file.source, file.locale),
					displayPath: getDisplayPath(config, file.source, file.locale),
				});
			}
		}

		if (!localeHasChanges && options.file !== undefined) {
			skippedLocales.push(locale);
		}
	}

	return {
		plan: {
			files: planFiles,
		},
		skippedLocales,
	};
}

function getTargetDocument(
	config: TringConfig,
	sourceFile: TranslationFile,
	targets: TranslationDocument[],
): TranslationDocument | undefined {
	switch (config.layout) {
		case TranslationLayout.files:
			return targets[0];

		case TranslationLayout.directories:
			return targets.find((document) => document.file.key === sourceFile.key);
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
