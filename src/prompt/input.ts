import { input as inquirerInput } from "@inquirer/prompts";

export type InputOptions = Parameters<typeof inquirerInput>[0];

export function input(options: InputOptions): Promise<string> {
	return inquirerInput(options);
}
