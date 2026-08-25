import { Gap, Indent, logger } from "../src/logger";

logger.text("LOGGER PREVIEW", {
	bold: true,
});

logger.newLine();

logger.text("Basic Text");

logger.text("Bold Text", {
	bold: true,
});

logger.newLine();

logger.text("Colored Messages", {
	bold: true,
});

logger.success("Success message");
logger.error("Error message");
logger.warning("Warning message");
logger.info("Info message");
logger.hint("Hint message");

logger.newLine();

logger.text("Icon Messages", {
	bold: true,
});

logger.successIcon("Operation completed successfully");
logger.errorIcon("Something went wrong");
logger.warningIcon("Please check the configuration");
logger.infoIcon("Information message");

logger.newLine();

logger.text("Mark Messages", {
	bold: true,
});

logger.successMark("Translation file found");
logger.errorMark("Translation file missing");
logger.warningMark("Translation file needs attention");
logger.infoMark("Translation file information");

logger.newLine();

logger.text("Separate Messages", {
	bold: true,
});

logger.separate("Source", "en-US");

logger.separate("Source", "en-US", {
	gap: Gap.level1,
});

logger.separate("Translation", ["en-US", "ar-SA"], {
	gap: Gap.level1,
});

logger.separateSuccessMark("auth.json", "en-US", {
	indent: Indent.level1,
});

logger.separateErrorMark("settings.json", "ar-SA", {
	indent: Indent.level1,
});

logger.separateWarningMark("common.json", "fr-FR", {
	indent: Indent.level1,
});

logger.separateInfoMark("dashboard.json", "de-DE", {
	indent: Indent.level1,
});

logger.bullet("notifications.json", "ar-SA", {
	indent: Indent.level1,
});

logger.newLine();

logger.text("Text With Hint", {
	bold: true,
});

logger.textWithHint("Source", "en-US");
logger.textWithHint("Target", "ar-SA");

logger.textWithHint("Configuration", "tring.config.ts", {
	gapHint: Gap.level2,
});

logger.newLine();

logger.text("Indentation", {
	bold: true,
});

logger.text("Level 0");
logger.text("Level 1", {
	indent: Indent.level1,
});
logger.text("Level 2", {
	indent: Indent.level2,
});
logger.text("Level 3", {
	indent: Indent.level3,
});

logger.newLine();

logger.text("Combined Options", {
	bold: true,
});

logger.success("Success with indentation", {
	indent: Indent.level1,
});

logger.error("Error with indentation", {
	indent: Indent.level1,
});

logger.warning("Warning with indentation", {
	indent: Indent.level2,
});

logger.info("Info with indentation", {
	indent: Indent.level2,
});

logger.newLine();

logger.text("Complete", {
	bold: true,
});

logger.successMark("8 translation files", {
	indent: Indent.level1,
});

logger.errorMark("2 files missing", {
	indent: Indent.level1,
});

logger.warningMark("3 files require attention", {
	indent: Indent.level1,
});

logger.separate("Source", "en-US", {
	indent: Indent.level1,
	gap: Gap.level1,
});

logger.separate("Target", "ar-SA", {
	indent: Indent.level1,
	gap: Gap.level1,
});

logger.newLine();

logger.successIcon("Logger preview completed.");
