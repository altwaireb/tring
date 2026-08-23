import chalk from "chalk";

import { COLUMN_SEPARATOR, SYMBOLS } from "@/constants";

import {
	Indent,
	type LoggerOptions,
	type SeparateOptions,
	type TextWithHintOptions,
} from "./types";

function applyOptions(message: string, options: LoggerOptions): string {
	let output = message;

	if (options.bold) {
		output = chalk.bold(output);
	}

	return output;
}

function applyIndent(message: string, indent: Indent = 0): string {
	return `${" ".repeat(indent)}${message}`;
}

function formatMessage(message: string, options: LoggerOptions = {}): string {
	const output = applyOptions(message, options);

	return applyIndent(output, options.indent ?? 0);
}

function formatIconMark(
	icon: string,
	message: string,
	options: LoggerOptions,
	color: (value: string) => string,
): string {
	const indent = options.indent ?? 0;
	const formattedMessage = applyOptions(message, options);

	return `${" ".repeat(indent)}${color(icon)} ${chalk.white(formattedMessage)}`;
}

function formatTextWithHint(
	message: string,
	hint: string,
	options: TextWithHintOptions,
): string {
	const indent = options.indent ?? 0;
	const gap = " ".repeat(options.gapHint ?? 2);
	const formattedMessage = applyOptions(message, options);

	return `${" ".repeat(indent)}${chalk.white(formattedMessage)}${gap}${chalk.gray(hint)}`;
}

function formatSeparate(
	message: string,
	messages: string | string[],
	options: SeparateOptions = {},
): string {
	const values = [
		message,
		...(Array.isArray(messages) ? messages : [messages]),
	];

	const gap = " ".repeat(options.gap ?? 1);

	const output = values
		.map((value, index) => {
			if (index === 0) {
				return value;
			}

			return `${gap}${COLUMN_SEPARATOR}${gap}${value}`;
		})
		.join("");

	return applyIndent(
		applyOptions(output, options),
		options.indent ?? Indent.level0,
	);
}

function formatSeparateMark(
	icon: string,
	message: string,
	messages: string | string[],
	options: SeparateOptions,
	color: (value: string) => string,
): string {
	const indent = options.indent ?? Indent.level0;

	const output = formatSeparate(message, messages, {
		...options,
		indent: Indent.level0,
	});

	return `${" ".repeat(indent)}${color(icon)} ${chalk.white(output)}`;
}

export const logger = {
	newLine(): void {
		console.log();
	},

	text(message: string, options: LoggerOptions = {}): void {
		console.log(chalk.white(formatMessage(message, options)));
	},

	success(message: string, options: LoggerOptions = {}): void {
		console.log(chalk.green(formatMessage(message, options)));
	},

	error(message: string, options: LoggerOptions = {}): void {
		console.log(chalk.red(formatMessage(message, options)));
	},

	warning(message: string, options: LoggerOptions = {}): void {
		console.log(chalk.yellow(formatMessage(message, options)));
	},

	info(message: string, options: LoggerOptions = {}): void {
		console.log(chalk.cyan(formatMessage(message, options)));
	},

	hint(message: string, options: LoggerOptions = {}): void {
		console.log(chalk.gray(formatMessage(message, options)));
	},

	successIcon(message: string, options: LoggerOptions = {}): void {
		console.log(
			chalk.green(formatMessage(`${SYMBOLS.success} ${message}`, options)),
		);
	},

	errorIcon(message: string, options: LoggerOptions = {}): void {
		console.log(
			chalk.red(formatMessage(`${SYMBOLS.error} ${message}`, options)),
		);
	},

	warningIcon(message: string, options: LoggerOptions = {}): void {
		console.log(
			chalk.yellow(formatMessage(`${SYMBOLS.warning} ${message}`, options)),
		);
	},

	infoIcon(message: string, options: LoggerOptions = {}): void {
		console.log(
			chalk.cyan(formatMessage(`${SYMBOLS.info} ${message}`, options)),
		);
	},

	successMark(message: string, options: LoggerOptions = {}): void {
		console.log(formatIconMark(SYMBOLS.success, message, options, chalk.green));
	},

	errorMark(message: string, options: LoggerOptions = {}): void {
		console.log(formatIconMark(SYMBOLS.error, message, options, chalk.red));
	},

	warningMark(message: string, options: LoggerOptions = {}): void {
		console.log(
			formatIconMark(SYMBOLS.warning, message, options, chalk.yellow),
		);
	},

	infoMark(message: string, options: LoggerOptions = {}): void {
		console.log(formatIconMark(SYMBOLS.info, message, options, chalk.cyan));
	},

	textWithHint(
		message: string,
		hint: string,
		options: TextWithHintOptions = {},
	): void {
		console.log(formatTextWithHint(message, hint, options));
	},

	separate(
		message: string,
		messages: string | string[],
		options: SeparateOptions = {},
	): void {
		console.log(formatSeparate(message, messages, options));
	},

	separateSuccessMark(
		message: string,
		messages: string | string[],
		options: SeparateOptions = {},
	): void {
		console.log(
			formatSeparateMark(
				SYMBOLS.success,
				message,
				messages,
				options,
				chalk.green,
			),
		);
	},

	separateErrorMark(
		message: string,
		messages: string | string[],
		options: SeparateOptions = {},
	): void {
		console.log(
			formatSeparateMark(SYMBOLS.error, message, messages, options, chalk.red),
		);
	},

	separateWarningMark(
		message: string,
		messages: string | string[],
		options: SeparateOptions = {},
	): void {
		console.log(
			formatSeparateMark(
				SYMBOLS.warning,
				message,
				messages,
				options,
				chalk.yellow,
			),
		);
	},

	separateInfoMark(
		message: string,
		messages: string | string[],
		options: SeparateOptions = {},
	): void {
		console.log(
			formatSeparateMark(SYMBOLS.info, message, messages, options, chalk.cyan),
		);
	},

	bullet(
		message: string,
		messages: string | string[],
		options: SeparateOptions = {},
	): void {
		console.log(
			formatSeparateMark(
				SYMBOLS.bullet,
				message,
				messages,
				options,
				chalk.white,
			),
		);
	},
};
