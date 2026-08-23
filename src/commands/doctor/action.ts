import { loadTringConfig } from "@/config";
import { logger } from "@/logger";
import { checkConfiguration } from "./checks/configuration";
import { checkLocales } from "./checks/locales";
import { checkTranslationDirectory } from "./checks/translation-directory";
import { checkTranslationLayout } from "./checks/translation-layout";

export async function runDoctor(): Promise<boolean> {
	try {
		const result = await loadTringConfig();

		if (!result.configFile || !result.config) {
			logger.error("Tring configuration file was not found. Run `tring init`.");

			return false;
		}

		const configuration = checkConfiguration(result.configFile);

		if (!configuration.success) {
			logger.error(configuration.message);
			return false;
		}

		logger.success(configuration.message);

		const translationDirectory = await checkTranslationDirectory(result.config);

		if (!translationDirectory.success) {
			logger.error(translationDirectory.message);
			return false;
		}

		logger.success(translationDirectory.message);

		const translationLayout = await checkTranslationLayout(result.config);

		if (!translationLayout.success) {
			logger.error(translationLayout.message);
			return false;
		}

		logger.success(translationLayout.message);

		const locales = await checkLocales(result.config);

		if (!locales.success) {
			logger.error(locales.message);
			return false;
		}

		logger.success(locales.message);

		return true;
	} catch {
		logger.error("Failed to load Tring configuration. Run `tring init`.");
		return false;
	}
}
