import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/logger";
import { Gap, Indent } from "@/logger/types";

describe("logger", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("exposes the expected indent levels", () => {
		expect(Indent.level1).toBe(2);
		expect(Indent.level2).toBe(4);
		expect(Indent.level3).toBe(6);
	});

	it("exposes the expected gap levels", () => {
		expect(Gap.level1).toBe(2);
		expect(Gap.level2).toBe(4);
		expect(Gap.level3).toBe(6);
	});

	it("prints a success message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.success("Sorted 25 translation files.");

		expect(consoleLog).toHaveBeenCalledWith("Sorted 25 translation files.");
	});

	it("prints a bold success message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.success("Sorted 25 translation files.", {
			bold: true,
		});

		expect(consoleLog).toHaveBeenCalled();
		expect(consoleLog.mock.calls[0]?.[0]).toContain(
			"Sorted 25 translation files.",
		);
	});

	it("prints a success message with indentation", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.success("Sorted 25 translation files.", {
			indent: Indent.level1,
		});

		expect(consoleLog).toHaveBeenCalledWith("  Sorted 25 translation files.");
	});

	it("prints a bold success message with indentation", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.success("Sorted 25 translation files.", {
			bold: true,
			indent: Indent.level2,
		});

		expect(consoleLog).toHaveBeenCalled();
		expect(consoleLog.mock.calls[0]?.[0]).toContain(
			"Sorted 25 translation files.",
		);
	});

	it("prints an error message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.error("Something went wrong.");

		expect(consoleLog).toHaveBeenCalledWith("Something went wrong.");
	});

	it("prints a warning message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.warning("Translation is missing.");

		expect(consoleLog).toHaveBeenCalledWith("Translation is missing.");
	});

	it("prints an info message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.info("Source locale: en-US.");

		expect(consoleLog).toHaveBeenCalledWith("Source locale: en-US.");
	});

	it("prints a hint message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.hint("Press Enter to continue.");

		expect(consoleLog).toHaveBeenCalledWith("Press Enter to continue.");
	});

	it("applies options to logger messages", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.error("Error message.", {
			bold: true,
			indent: Indent.level2,
		});

		expect(consoleLog).toHaveBeenCalled();
		expect(consoleLog.mock.calls[0]?.[0]).toContain("Error message.");
		expect(consoleLog.mock.calls[0]?.[0]).toContain("    ");
	});

	it("prints a text message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.text("Translation Analysis");

		expect(consoleLog).toHaveBeenCalledWith("Translation Analysis");
	});

	it("prints a success icon message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.successIcon("Sorted 25 translation files.");

		expect(consoleLog).toHaveBeenCalledWith("✓ Sorted 25 translation files.");
	});

	it("prints an error icon message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.errorIcon("Translation file was not found.");

		expect(consoleLog).toHaveBeenCalledWith(
			"✗ Translation file was not found.",
		);
	});

	it("prints a warning icon message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.warningIcon("Translation is missing.");

		expect(consoleLog).toHaveBeenCalledWith("⚠ Translation is missing.");
	});

	it("prints an info icon message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.infoIcon("Source locale: en-US.");

		expect(consoleLog).toHaveBeenCalledWith("ℹ Source locale: en-US.");
	});

	it("prints a success icon mark message", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.successMark("Sorted 25 translation files.");

		expect(consoleLog).toHaveBeenCalledWith("✓ Sorted 25 translation files.");
	});

	it("applies indentation to icon mark messages", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.successMark("Sorted 25 translation files.", {
			indent: Indent.level1,
		});

		expect(consoleLog).toHaveBeenCalledWith("  ✓ Sorted 25 translation files.");
	});

	it("applies bold to icon mark messages", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.successMark("Sorted 25 translation files.", {
			bold: true,
		});

		expect(consoleLog).toHaveBeenCalled();
		expect(consoleLog.mock.calls[0]?.[0]).toContain(
			"Sorted 25 translation files.",
		);
	});

	it("prints text with a hint", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.textWithHint("Source:", "en-US");

		expect(consoleLog).toHaveBeenCalledWith("Source:  en-US");
	});

	it("applies the hint gap", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.textWithHint("Source:", "en-US", {
			gapHint: Gap.level3,
		});

		expect(consoleLog).toHaveBeenCalledWith("Source:      en-US");
	});

	it("applies indentation to text with a hint", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.textWithHint("Source:", "en-US", {
			indent: Indent.level2,
		});

		expect(consoleLog).toHaveBeenCalledWith("    Source:  en-US");
	});

	it("applies bold to text with a hint", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.textWithHint("Source:", "en-US", {
			bold: true,
		});

		expect(consoleLog).toHaveBeenCalled();
		expect(consoleLog.mock.calls[0]?.[0]).toContain("Source:");
		expect(consoleLog.mock.calls[0]?.[0]).toContain("en-US");
	});

	it("prints a new line", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.newLine();

		expect(consoleLog).toHaveBeenCalledWith();
	});

	it("prints separated values", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.separate("auth.login.button", ["ar-SA", "auth.json"]);

		expect(consoleLog).toHaveBeenCalledWith(
			"auth.login.button │ ar-SA │ auth.json",
		);
	});

	it("prints separated values with a gap", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.separate("auth.login.button", ["ar-SA", "auth.json"], {
			gap: Gap.level1,
		});

		expect(consoleLog).toHaveBeenCalledWith(
			"auth.login.button  │  ar-SA  │  auth.json",
		);
	});

	it("prints separated values with indentation", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.separate("auth.login.button", ["ar-SA", "auth.json"], {
			gap: Gap.level1,
			indent: Indent.level1,
		});

		expect(consoleLog).toHaveBeenCalledWith(
			"  auth.login.button  │  ar-SA  │  auth.json",
		);
	});

	it("prints a separated success mark", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.separateSuccessMark("auth.login.button", ["ar-SA", "auth.json"]);

		expect(consoleLog).toHaveBeenCalledWith(
			"✓ auth.login.button │ ar-SA │ auth.json",
		);
	});

	it("prints a separated success mark with indentation", () => {
		const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

		logger.separateSuccessMark("auth.login.button", ["ar-SA", "auth.json"], {
			gap: Gap.level1,
			indent: Indent.level1,
		});

		expect(consoleLog).toHaveBeenCalledWith(
			"  ✓ auth.login.button  │  ar-SA  │  auth.json",
		);
	});
});
