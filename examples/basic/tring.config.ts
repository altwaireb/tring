import { defineConfig, TranslationLayout } from "tring";

export default defineConfig({
	directory: "app/i18n",

	layout: TranslationLayout.directories,

	source: "en-US",

	locales: ["ar-SA", "fr-FR", "de-DE"],
});
