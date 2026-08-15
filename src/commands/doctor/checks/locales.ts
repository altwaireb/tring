import type { TringConfig } from "@/config";
import { TranslationLayout } from "@/config";
import { exists, join } from "@/filesystem";
import type { CheckResult } from "./result";

export async function checkLocales(config: TringConfig): Promise<CheckResult> {
	for (const locale of config.locales) {
		const localePath = getLocalePath(config, locale);

		if (!(await exists(localePath))) {
			return {
				success: false,
				message: `Locale does not exist: ${localePath}`,
			};
		}
	}

	return {
		success: true,
		message: `Locales found: ${config.locales.join(", ")}`,
	};
}

function getLocalePath(config: TringConfig, locale: string): string {
	switch (config.layout) {
		case TranslationLayout.files:
			return join(config.directory, `${locale}.json`);

		case TranslationLayout.directories:
			return join(config.directory, locale);
	}
}
