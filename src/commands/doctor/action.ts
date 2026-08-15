import { loadTringConfig } from "@/config";
import { log } from "@/logger";
import { checkConfiguration } from "./checks/configuration";
import { checkLocales } from "./checks/locales";
import { checkTranslationDirectory } from "./checks/translation-directory";
import { checkTranslationLayout } from "./checks/translation-layout";

export async function runDoctor(): Promise<boolean> {
	try {
		const result = await loadTringConfig();

		if (!result.configFile || !result.config) {
			log.error("Tring configuration file was not found. Run `tring init`.");

			return false;
		}

		const configuration = checkConfiguration(result.configFile);

		if (!configuration.success) {
			log.error(configuration.message);
			return false;
		}

		log.success(configuration.message);

		const translationDirectory = await checkTranslationDirectory(result.config);

		if (!translationDirectory.success) {
			log.error(translationDirectory.message);
			return false;
		}

		log.success(translationDirectory.message);

		const translationLayout = await checkTranslationLayout(result.config);

		if (!translationLayout.success) {
			log.error(translationLayout.message);
			return false;
		}

		log.success(translationLayout.message);

		const locales = await checkLocales(result.config);

		if (!locales.success) {
			log.error(locales.message);
			return false;
		}

		log.success(locales.message);

		return true;
	} catch {
		log.error("Failed to load Tring configuration. Run `tring init`.");
		return false;
	}
}
