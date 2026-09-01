import type { TringConfig } from "@/config";
import { dirname, mkdir, read, write } from "@/filesystem";
import { isJsonObject, type JsonObject } from "@/json";

import type { TranslationAddFile } from "./add";

export interface TranslationAddWriteFile extends TranslationAddFile {
	targetPath: string;
	displayPath: string;
}

export interface TranslationAddWritePlan {
	files: TranslationAddWriteFile[];
}

export interface TranslationAddWriteResult {
	filesCreated: number;
	filesUpdated: number;
}

/** Applies a translation add plan to the target files. */
export async function applyTranslationAddPlan(
	config: TringConfig,
	plan: TranslationAddWritePlan,
	empty: boolean,
): Promise<TranslationAddWriteResult> {
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

		for (const change of file.changes) {
			setTranslationValue(data, change.key, empty ? "" : change.sourceValue);
		}

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

function setTranslationValue(
	document: JsonObject,
	key: string,
	value: string,
): void {
	const parts = key.split(".");
	const lastPart = parts.pop();

	if (lastPart === undefined) {
		return;
	}

	let current = document;

	for (const part of parts) {
		const existing = current[part];

		if (
			typeof existing !== "object" ||
			existing === null ||
			Array.isArray(existing)
		) {
			current[part] = {};
		}

		current = current[part] as JsonObject;
	}

	current[lastPart] = value;
}
