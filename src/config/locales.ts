import type {
	ArrayLiteralExpression,
	ObjectLiteralExpression,
	SourceFile,
} from "ts-morph";
import { Node, Project, SyntaxKind } from "ts-morph";

import { loadTringConfig } from "./loader";

async function loadConfigSourceFile(): Promise<SourceFile> {
	const result = await loadTringConfig();

	if (!result._configFile) {
		throw new Error("Could not determine the Tring configuration file path.");
	}

	const project = new Project({
		skipAddingFilesFromTsConfig: true,
	});

	return project.addSourceFileAtPath(result._configFile);
}

function getConfigObject(sourceFile: SourceFile): ObjectLiteralExpression {
	const defineConfigCall = sourceFile
		.getDescendantsOfKind(SyntaxKind.CallExpression)
		.find((call) => call.getExpression().getText() === "defineConfig");

	if (!defineConfigCall) {
		throw new Error(
			'Could not find a "defineConfig" call in the Tring configuration file.',
		);
	}

	const argument = defineConfigCall.getArguments()[0];

	if (!argument || !Node.isObjectLiteralExpression(argument)) {
		throw new Error(
			"Tring configuration must pass an object to defineConfig().",
		);
	}

	return argument;
}

function getLocalesArray(
	configObject: ObjectLiteralExpression,
): ArrayLiteralExpression {
	const localesProperty = configObject.getProperty("locales");

	if (!localesProperty || !Node.isPropertyAssignment(localesProperty)) {
		throw new Error(
			'Could not find the "locales" property in the Tring configuration.',
		);
	}

	const initializer = localesProperty.getInitializer();

	if (!initializer || !Node.isArrayLiteralExpression(initializer)) {
		throw new Error(
			'The "locales" property must be initialized with an array.',
		);
	}

	return initializer;
}

function getLocaleValue(element: Node): string | undefined {
	if (!Node.isStringLiteral(element)) {
		return undefined;
	}

	return element.getLiteralValue();
}

function localeExists(
	locales: ArrayLiteralExpression,
	locale: string,
): boolean {
	return locales
		.getElements()
		.some((element) => getLocaleValue(element) === locale);
}

/**
 * Checks whether a locale is defined in the Tring configuration.
 */
export async function hasLocaleInConfig(locale: string): Promise<boolean> {
	const sourceFile = await loadConfigSourceFile();
	const configObject = getConfigObject(sourceFile);
	const locales = getLocalesArray(configObject);

	return localeExists(locales, locale);
}

/**
 * Adds a locale to the Tring configuration.
 */
export async function addLocaleToConfig(locale: string): Promise<void> {
	const sourceFile = await loadConfigSourceFile();
	const configObject = getConfigObject(sourceFile);
	const locales = getLocalesArray(configObject);

	if (localeExists(locales, locale)) {
		return;
	}

	locales.addElement(`"${locale}"`);

	await sourceFile.save();
}
