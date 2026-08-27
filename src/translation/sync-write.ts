import type { TringConfig } from "@/config";
import type { TranslationSyncFile } from "./sync";
import {
	applyTranslationPlan,
	type TranslationWritePlan,
	type TranslationWriteResult,
} from "./write";

export interface TranslationSyncWriteFile extends TranslationSyncFile {
	targetPath: string;
	displayPath: string;
}

export interface TranslationSyncWritePlan {
	files: TranslationSyncWriteFile[];
}

export type TranslationSyncWriteResult = TranslationWriteResult;

export async function applyTranslationSyncPlan(
	config: TringConfig,
	plan: TranslationSyncWritePlan,
	empty: boolean,
): Promise<TranslationSyncWriteResult> {
	return applyTranslationPlan(
		config,
		plan as unknown as TranslationWritePlan,
		empty,
	);
}
