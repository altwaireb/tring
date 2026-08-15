import type { TranslationFile } from "./file";

export interface MatchedTranslationFiles {
	source: TranslationFile;
	target: TranslationFile;
}

export interface TranslationFileComparison {
	missing: TranslationFile[];
	extra: TranslationFile[];
	matched: MatchedTranslationFiles[];
}

function getTranslationFileMatchKey(file: TranslationFile): string {
	if (file.isLocaleFile) {
		return "locale-file";
	}

	return `${file.directory}/${file.name}`;
}

export function compareTranslationFiles(
	source: TranslationFile[],
	target: TranslationFile[],
): TranslationFileComparison {
	const sourceByMatchKey = new Map(
		source.map((file) => [getTranslationFileMatchKey(file), file]),
	);

	const targetByMatchKey = new Map(
		target.map((file) => [getTranslationFileMatchKey(file), file]),
	);

	const missing: TranslationFile[] = [];
	const extra: TranslationFile[] = [];
	const matched: MatchedTranslationFiles[] = [];

	for (const sourceFile of source) {
		const matchKey = getTranslationFileMatchKey(sourceFile);
		const targetFile = targetByMatchKey.get(matchKey);

		if (targetFile) {
			matched.push({
				source: sourceFile,
				target: targetFile,
			});
		} else {
			missing.push(sourceFile);
		}
	}

	for (const targetFile of target) {
		const matchKey = getTranslationFileMatchKey(targetFile);

		if (!sourceByMatchKey.has(matchKey)) {
			extra.push(targetFile);
		}
	}

	return {
		missing,
		extra,
		matched,
	};
}
