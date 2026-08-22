export function createConfigTemplate() {
	return `import { defineConfig, TranslationLayout } from "tring";

export default defineConfig({
	directory: "app/i18n",

	layout: TranslationLayout.directories,

	source: "en-US",

	locales: [
		"ar-SA",
	],

	// JSON formatting options.
	// Recommended indent: 0-12 spaces. Default: 2.
	// json: {
	// 	indent: 2,
	// },
});
`;
}
