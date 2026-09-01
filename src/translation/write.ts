import type { TringConfig } from "@/config";
import { dirname, mkdir, read, write } from "@/filesystem";
import { isJsonObject, type JsonObject } from "@/json";

import { applyTranslationChanges, type TranslationChange } from "./apply";

export interface TranslationWriteFile {
	locale: string;
	source: {
		path: string;
	};
	target?: {
		path: string;
	};
	changes: readonly TranslationChange[];
	targetPath: string;
	displayPath: string;
}

export interface TranslationWritePlan {
	files: readonly TranslationWriteFile[];
}

export interface TranslationWriteResult {
	filesCreated: number;
	filesUpdated: number;
}

/** Applies a translation write plan to the target files. */
export async function applyTranslationPlan(
	config: TringConfig,
	plan: TranslationWritePlan,
	empty: boolean,
): Promise<TranslationWriteResult> {
	let filesCreated = 0;
	let filesUpdated = 0;

	for (const file of plan.files) {
		const isNewFile = file.target === undefined;

		let data: JsonObject;

		if (file.target) {
			const content = await read(file.target.path);
			const parsed: unknown = JSON.parse(content);

			if (!isJsonObject(parsed)) {
				throw new Error(
					`Translation file must contain a JSON object: ${file.target.path}`,
				);
			}

			data = parsed;
		} else {
			data = {};
		}

		applyTranslationChanges(data, file.changes, empty);

		if (isNewFile) {
			await mkdir(dirname(file.targetPath));
			filesCreated++;
		} else {
			filesUpdated++;
		}

		const indent = config.json?.indent ?? 2;

		await write(file.targetPath, `${JSON.stringify(data, null, indent)}\n`);
	}

	return {
		filesCreated,
		filesUpdated,
	};
}
