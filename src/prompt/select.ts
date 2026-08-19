import { select as inquirerSelect } from "@inquirer/prompts";

export type SelectOptions<Value> = Parameters<typeof inquirerSelect<Value>>[0];

export function select<const Value>(
	options: SelectOptions<Value>,
): Promise<Value> {
	return inquirerSelect(options);
}
