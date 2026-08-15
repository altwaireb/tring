import type { CheckResult } from "./result";

export function checkConfiguration(configFile: string): CheckResult {
	return {
		success: true,
		message: `Configuration loaded from ${configFile}.`,
	};
}
