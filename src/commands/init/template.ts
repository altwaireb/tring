export function createConfigTemplate() {
	return `import {
	defineConfig,
	TranslationKeyRule,
	TranslationLayout,
} from "@altwaireb/tring";

export default defineConfig({
	directory: "app/i18n",

	layout: TranslationLayout.directories,

	source: "en-US",

	locales: [
		"ar-SA",
	],

	// Translation key validation rule.
	// Default: TranslationKeyRule.alphaDash
	// Available: alpha, alphaNumeric, alphaDash, ascii, asciiSpaces
	keyRule: TranslationKeyRule.alphaDash,

	// JSON formatting options.
	// Recommended indent: 0-12 spaces. Default: 2.
	// json: {
	// 	indent: 2,
	// },
});
`;
}
