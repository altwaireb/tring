import { TranslationLayout, type TringConfig } from "@/config";
import { DEFAULT_INDENT } from "@/constants";
import {
	InvalidTranslationFilePathError,
	TranslationFileNotFoundError,
} from "@/exceptions";
import { write } from "@/filesystem";
import type { TranslationFile } from "@/translation";
import {
	discoverTranslationFiles,
	isTranslationObjectSorted,
	readTranslationFile,
	sortTranslationObject,
} from "@/translation";

export interface SortApplicationOptions {
	file?: string;
	locale?: string;
}

export interface SortApplicationResult {
	results: TranslationSortResult[];
}

export interface TranslationSortResult {
	file: TranslationFile;
	isModified: boolean;
}

export async function sortApplication(
	config: TringConfig,
	options: SortApplicationOptions = {},
): Promise<SortApplicationResult> {
	const files = await discoverTranslationFiles(config);
	const selectedFiles = selectSortFiles(files, options, config);

	if (options.file !== undefined && selectedFiles.length === 0) {
		throw new TranslationFileNotFoundError(options.file);
	}

	const results: TranslationSortResult[] = [];
	const indent = config.json?.indent ?? DEFAULT_INDENT;

	for (const file of selectedFiles) {
		const document = await readTranslationFile(file);

		if (isTranslationObjectSorted(document.data)) {
			results.push({
				file,
				isModified: false,
			});

			continue;
		}

		const sorted = sortTranslationObject(document.data);
		const content = `${JSON.stringify(sorted, null, indent)}\n`;

		await write(file.path, content);

		results.push({
			file,
			isModified: true,
		});
	}

	return {
		results,
	};
}

function selectSortFiles(
	files: TranslationFile[],
	options: SortApplicationOptions,
	config: TringConfig,
): TranslationFile[] {
	if (options.file !== undefined) {
		if (config.layout === TranslationLayout.files) {
			if (options.file.includes("/")) {
				throw new InvalidTranslationFilePathError(options.file);
			}

			return files.filter((file) => file.key === options.file);
		}

		const separatorIndex = options.file.indexOf("/");

		if (separatorIndex <= 0) {
			throw new InvalidTranslationFilePathError(options.file);
		}

		const locale = options.file.slice(0, separatorIndex);
		const key = options.file.slice(separatorIndex + 1);

		const locales = new Set([config.source, ...config.locales]);

		if (!locales.has(locale) || !key) {
			throw new InvalidTranslationFilePathError(options.file);
		}

		return files.filter((file) => file.locale === locale && file.key === key);
	}

	if (options.locale !== undefined) {
		return files.filter((file) => file.locale === options.locale);
	}

	return files;
}
