import { read } from "@/filesystem";
import { isJsonObject } from "@/json";

import type { TranslationDocument } from "./document";
import type { TranslationFile } from "./file";

export async function readTranslationFile(
	file: TranslationFile,
): Promise<TranslationDocument> {
	const content = await read(file.path);
	const data: unknown = JSON.parse(content);

	if (!isJsonObject(data)) {
		throw new Error(
			`Translation file must contain a JSON object: ${file.path}`,
		);
	}

	return {
		file,
		data,
	};
}
