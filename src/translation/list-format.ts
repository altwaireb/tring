import type { ListApplicationResult } from "@/app";

export interface FormatTranslationResourcesOptions {
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

function appendTree(lines: string[], node: FileTreeNode, depth: number): void {
	const indentation = "  ".repeat(depth);

	const files = [...node.files].sort((a, b) => a.localeCompare(b));

	for (const file of files) {
		lines.push(`${indentation}${file}`);
	}

	const directories = [...node.directories.entries()].sort(([a], [b]) =>
		a.localeCompare(b),
	);

	for (const [directory, child] of directories) {
		lines.push(`${indentation}${directory}/`);
		appendTree(lines, child, depth + 1);
	}
}

export function formatTranslationResources(
	result: ListApplicationResult,
	options: FormatTranslationResourcesOptions = {},
): string {
	const lines: string[] = [
		"Translation Resources",
		"",
		`Source: ${result.source}`,
	];

	for (const resource of result.resources) {
		const fileLabel = resource.files.length === 1 ? "file" : "files";

		lines.push(
			"",
			`${resource.locale} (${resource.files.length} ${fileLabel})`,
		);

		if (!options.showFiles) {
			continue;
		}

		const tree = createTree(resource.files.map((file) => file.key));

		appendTree(lines, tree, 1);
	}

	return lines.join("\n");
}
