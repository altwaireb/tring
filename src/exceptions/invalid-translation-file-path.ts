export class InvalidTranslationFilePathError extends Error {
	constructor(file: string) {
		super(`Invalid translation file path: ${file}`);

		this.name = "InvalidTranslationFilePathError";
	}
}
