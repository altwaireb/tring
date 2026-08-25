import type { DoctorCommandResult } from "@/cli/commands/doctor";
import { logger } from "@/logger";

export function printDoctorResult(result: DoctorCommandResult): void {
	if (result.error) {
		logger.errorMark(result.error);
		return;
	}

	for (const check of result.checks) {
		if (check.success) {
			logger.successMark(check.message);
		} else {
			logger.errorMark(check.message);
		}
	}
}
