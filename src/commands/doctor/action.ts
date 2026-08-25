import { loadTringConfig } from "@/config";
import { checkConfiguration } from "./checks/configuration";
import { checkLocales } from "./checks/locales";
import type { CheckResult } from "./checks/result";
import { checkTranslationDirectory } from "./checks/translation-directory";
import { checkTranslationLayout } from "./checks/translation-layout";

export interface DoctorCommandResult {
	checks: CheckResult[];
	success: boolean;
	error?: string;
}

export async function runDoctor(): Promise<DoctorCommandResult> {
	try {
		const result = await loadTringConfig();

		if (!result.configFile || !result.config) {
			return {
				checks: [],
				success: false,
				error: "Tring configuration file was not found. Run `tring init`.",
			};
		}

		const checks: CheckResult[] = [];

		const configuration = checkConfiguration(result.configFile);
		checks.push(configuration);

		if (!configuration.success) {
			return {
				checks,
				success: false,
			};
		}

		const translationDirectory = await checkTranslationDirectory(result.config);
		checks.push(translationDirectory);

		if (!translationDirectory.success) {
			return {
				checks,
				success: false,
			};
		}

		const translationLayout = await checkTranslationLayout(result.config);
		checks.push(translationLayout);

		if (!translationLayout.success) {
			return {
				checks,
				success: false,
			};
		}

		const locales = await checkLocales(result.config);
		checks.push(locales);

		if (!locales.success) {
			return {
				checks,
				success: false,
			};
		}

		return {
			checks,
			success: true,
		};
	} catch {
		return {
			checks: [],
			success: false,
			error: "Failed to load Tring configuration. Run `tring init`.",
		};
	}
}
