export class TranslationFileNotFoundError extends Error {
	constructor(file: string) {
		super(`Translation file not found: ${file}`);

		this.name = "TranslationFileNotFoundError";
	}
}
