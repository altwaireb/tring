import { afterEach, describe, expect, it, vi } from "vitest";
import type { DoctorCommandResult } from "@/commands/doctor/action";
import { printDoctorResult } from "@/commands/doctor/output";

const logger = vi.hoisted(() => ({
	successMark: vi.fn(),
	errorMark: vi.fn(),
}));

vi.mock("@/logger", () => ({
	logger,
}));

describe("doctor output", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("prints successful checks", () => {
		const result: DoctorCommandResult = {
			success: true,
			checks: [
				{
					success: true,
					message: "Configuration loaded from tring.config.ts.",
				},
				{
					success: true,
					message: "Translation directory found: i18n.",
				},
			],
		};

		printDoctorResult(result);

		expect(logger.successMark).toHaveBeenCalledTimes(2);
		expect(logger.successMark).toHaveBeenNthCalledWith(
			1,
			"Configuration loaded from tring.config.ts.",
		);
		expect(logger.successMark).toHaveBeenNthCalledWith(
			2,
			"Translation directory found: i18n.",
		);
		expect(logger.errorMark).not.toHaveBeenCalled();
	});

	it("prints a failed check", () => {
		const result: DoctorCommandResult = {
			success: false,
			checks: [
				{
					success: false,
					message: "Translation directory does not exist: i18n.",
				},
			],
		};

		printDoctorResult(result);

		expect(logger.errorMark).toHaveBeenCalledTimes(1);
		expect(logger.errorMark).toHaveBeenCalledWith(
			"Translation directory does not exist: i18n.",
		);
		expect(logger.successMark).not.toHaveBeenCalled();
	});

	it("prints a command error", () => {
		const result: DoctorCommandResult = {
			success: false,
			checks: [],
			error: "Tring configuration file was not found. Run `tring init`.",
		};

		printDoctorResult(result);

		expect(logger.errorMark).toHaveBeenCalledTimes(1);
		expect(logger.errorMark).toHaveBeenCalledWith(
			"Tring configuration file was not found. Run `tring init`.",
		);
	});

	it("does not print an error when all checks succeed", () => {
		const result: DoctorCommandResult = {
			success: true,
			checks: [
				{
					success: true,
					message: "Configuration loaded.",
				},
			],
		};

		printDoctorResult(result);

		expect(logger.errorMark).not.toHaveBeenCalled();
	});
});
