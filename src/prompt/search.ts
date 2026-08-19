import { search as inquirerSearch } from "@inquirer/prompts";

export type SearchOptions<Value> = Parameters<typeof inquirerSearch<Value>>[0];

export function search<const Value>(
	options: SearchOptions<Value>,
): Promise<Value> {
	return inquirerSearch(options);
}
