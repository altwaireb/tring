import {
	compareApplication,
	compareResource,
	findTranslationKeyResources,
} from "@/app";
import type { TringConfig } from "@/config";
import { PAGE_SIZE } from "@/constants";
import { paginationPrompt, search } from "@/prompt";
import {
	formatTranslationComparison,
	getTranslationPage,
	type TranslationFile,
} from "@/translation";

export interface CompareCommandOptions {
	file?: string;
	key?: string;
}

export async function runCompareCommand(
	config: TringConfig,
	options: CompareCommandOptions = {},
) {
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

	let page = 0;

	while (true) {
		const currentPage = getTranslationPage(comparisons, page, PAGE_SIZE);

		console.log();

		if (page === 0) {
			console.log("Translation Comparison");
			console.log();
			console.log(resource.key);
			console.log();
		}

		console.log(
			formatTranslationComparison(currentPage.items, [
				config.source,
				...config.locales,
			]),
		);

		console.log();
		console.log(`Showing ${currentPage.shown} of ${currentPage.total} keys`);

		if (!currentPage.hasNext) {
			break;
		}

		const action = await paginationPrompt();

		if (action === "quit") {
			break;
		}

		page++;
	}

	return {
		exitCode: 0,
		resource,
	};
}
