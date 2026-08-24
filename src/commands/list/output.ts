import type { ListApplicationResult } from "@/app";
import { Gap, Indent, logger } from "@/logger";
import { MESSAGES } from "@/messages";

export interface PrintListResourcesOptions {
	showFiles?: boolean;
}

interface FileTreeNode {
	directories: Map<string, FileTreeNode>;
	files: string[];
}

function createTree(files: string[]): FileTreeNode {
	const root: FileTreeNode = {
		directories: new Map(),
		files: [],
	};

	for (const file of files) {
		const parts = file.split("/").filter(Boolean);

		let node = root;

		for (const part of parts.slice(0, -1)) {
			let child = node.directories.get(part);

			if (!child) {
				child = {
					directories: new Map(),
					files: [],
				};

				node.directories.set(part, child);
			}

			node = child;
		}

		const filename = parts.at(-1);

		if (filename) {
			node.files.push(filename);
		}
	}

	return root;
}

function printTree(node: FileTreeNode, depth: number): void {
	const indent = depth * Indent.level1;

	const files = [...node.files].sort((a, b) => a.localeCompare(b));

	for (const file of files) {
		logger.text(file, {
			indent,
		});
	}

	const directories = [...node.directories.entries()].sort(([a], [b]) =>
		a.localeCompare(b),
	);

	for (const [directory, child] of directories) {
		logger.text(`${directory}/`, {
			indent,
		});

		printTree(child, depth + 1);
	}
}

function printResource(locale: string, fileCount: number): void {
	const fileLabel = fileCount === 1 ? "file" : "files";

	logger.text(`${locale} (${fileCount} ${fileLabel})`, {
		bold: true,
	});
}

export function printListResources(
	result: ListApplicationResult,
	options: PrintListResourcesOptions = {},
): void {
	logger.text(MESSAGES.translationResources, {
		bold: true,
	});

	logger.separate(MESSAGES.source, result.source, {
		gap: Gap.level1,
	});

	for (const resource of result.resources) {
		logger.newLine();

		printResource(resource.locale, resource.files.length);

		if (!options.showFiles) {
			continue;
		}

		const tree = createTree(resource.files.map((file) => file.key));

		printTree(tree, 1);
	}
}
