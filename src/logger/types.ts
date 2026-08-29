export const Indent = {
	level0: 0,
	level1: 2,
	level2: 4,
	level3: 6,
} as const;

export type Indent = (typeof Indent)[keyof typeof Indent];

export const Gap = {
	level0: 0,
	level1: 2,
	level2: 4,
	level3: 6,
} as const;

export type Gap = (typeof Gap)[keyof typeof Gap];

export interface LoggerOptions {
	bold?: boolean;
	indent?: Indent | number;
}

export interface GitHubAnnotationOptions {
	file?: string;
	title?: string;
}

export interface TextWithHintOptions extends LoggerOptions {
	gapHint?: Gap;
}

export interface SeparateOptions extends LoggerOptions {
	gap?: Gap;
}
