import type { TranslationAnalysis, TranslationFileAnalysis } from "./analyze";
import type { TranslationKey } from "./key";

export interface TranslationKeyIssue {
	key: TranslationKey;
	locale: string;
	fileKey: string;
}

export interface TranslationReport {
	source: string;
	target: string;

	files: {
		missing: TranslationAnalysis["missingFiles"];
		extra: TranslationAnalysis["extraFiles"];
		matched: TranslationFileAnalysis[];
	};

	keys: {
		missing: TranslationKeyIssue[];
		extra: TranslationKeyIssue[];
	};

	summary: {
		filesMissing: number;
		filesExtra: number;
		keysMissing: number;
		extraKeys: number;
	};
}

export function createTranslationReport(
	analysis: TranslationAnalysis,
): TranslationReport {
	const missingKeys: TranslationKeyIssue[] = analysis.files.flatMap((file) =>
		file.missingKeys.map((key) => ({
			key,
			locale: file.target.locale,
			fileKey: file.target.key,
		})),
	);

	const extraKeys: TranslationKeyIssue[] = analysis.files.flatMap((file) =>
		file.extraKeys.map((key) => ({
			key,
			locale: file.target.locale,
			fileKey: file.target.key,
		})),
	);

	return {
		source: analysis.sourceLocale,
		target: analysis.targetLocale,

		files: {
			missing: analysis.missingFiles,
			extra: analysis.extraFiles,
			matched: analysis.files,
		},

		keys: {
			missing: missingKeys,
			extra: extraKeys,
		},

		summary: {
			filesMissing: analysis.missingFiles.length,
			filesExtra: analysis.extraFiles.length,
			keysMissing: missingKeys.length,
			extraKeys: extraKeys.length,
		},
	};
}
