import type { TringConfig } from "@/config";
import { dirname, mkdir, read, write } from "@/filesystem";
import { isJsonObject, type JsonObject } from "@/json";

import type { TranslationSyncFile } from "./sync";
import { applyTranslationSyncChanges } from "./sync-apply";

export interface TranslationSyncWriteFile extends TranslationSyncFile {
	targetPath: string;
	displayPath: string;
}

export interface TranslationSyncWritePlan {
	files: TranslationSyncWriteFile[];
}

export interface TranslationSyncWriteResult {
	filesCreated: number;
	filesUpdated: number;
}

export async function applyTranslationSyncPlan(
	config: TringConfig,
	plan: TranslationSyncWritePlan,
	empty: boolean,
): Promise<TranslationSyncWriteResult> {
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

		applyTranslationSyncChanges(data, file.changes, empty);

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
