import { exists, join } from "@/filesystem";

import type { TranslationFile } from "../file";
import type { TranslationLocale } from "../locale";
import type { TranslationLayoutAdapter } from "./adapter";

export const filesLayout: TranslationLayoutAdapter = {
	resolveLocale(directory, locale): TranslationLocale {
		return {
			locale,
			path: join(directory, `${locale}.json`),
		};
	},

	async discoverFiles(locale): Promise<TranslationFile[]> {
		if (!(await exists(locale.path))) {
			return [];
		}

		return [
			{
				locale: locale.locale,
				directory: "",
				name: "locale",
				filename: `${locale.locale}.json`,
				key: `${locale.locale}.json`,
				isLocaleFile: true,
				path: locale.path,
			},
		];
	},
};
