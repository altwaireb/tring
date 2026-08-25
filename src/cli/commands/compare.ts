import {
	compareApplication,
	compareResource,
	findTranslationKeyResources,
} from "@/app";
import type { TringConfig } from "@/config";
import { PAGE_SIZE } from "@/constants";
import { search } from "@/prompt";
import type {
	TranslationFile,
	TranslationValueComparison,
} from "@/translation";

export interface CompareCommandOptions {
	file?: string;
	key?: string;
}

export interface CompareCommandResult {
	exitCode: number;
	resource: TranslationFile;
	comparisons: TranslationValueComparison[];
	locales: string[];
}

export async function runCompareCommand(
	config: TringConfig,
	options: CompareCommandOptions = {},
): Promise<CompareCommandResult> {
	const result = await compareApplication(config);

	let resource: TranslationFile;

	if (options.file) {
		const foundResource = result.resources.find(
			(resource) => resource.key === options.file,
		);

		if (!foundResource) {
			throw new Error(`Translation resource was not found: "${options.file}".`);
		}

		resource = foundResource;
	} else if (options.key) {
		const resources = await findTranslationKeyResources(config, options.key);

		if (resources.length === 0) {
			throw new Error(
				`Translation key was not found in source resources: "${options.key}".`,
			);
		}

		if (resources.length === 1) {
			const foundResource = resources[0];

			if (!foundResource) {
				throw new Error(
					`Translation key was not found in source resources: "${options.key}".`,
				);
			}

			resource = foundResource;
		} else {
			resource = await search({
				message: "Select a resource:",
				pageSize: PAGE_SIZE,
				source: async (term) => {
					const normalizedTerm = term?.trim().toLowerCase();

					return resources
						.filter((resource) => {
							if (!normalizedTerm) {
								return true;
							}

							return resource.key.toLowerCase().includes(normalizedTerm);
						})
						.map((resource) => ({
							name: resource.key,
							value: resource,
						}));
				},
			});
		}
	} else {
		resource = await search({
			message: "Select a resource:",
			pageSize: PAGE_SIZE,
			source: async (term) => {
				const normalizedTerm = term?.trim().toLowerCase();

				return result.resources
					.filter((resource) => {
						if (!normalizedTerm) {
							return true;
						}

						return resource.key.toLowerCase().includes(normalizedTerm);
					})
					.map((resource) => ({
						name: resource.key,
						value: resource,
					}));
			},
		});
	}

	const comparison = await compareResource(config, resource);

	if (options.key) {
		const keyExists = comparison.comparisons.some(
			(comparison) => comparison.key === options.key,
		);

		if (!keyExists) {
			throw new Error(`Translation key was not found: "${options.key}".`);
		}
	}

	const comparisons = options.key
		? comparison.comparisons.filter(
				(comparison) => comparison.key === options.key,
			)
		: comparison.comparisons;

	return {
		exitCode: 0,
		resource,
		comparisons,
		locales: [config.source, ...config.locales],
	};
}
