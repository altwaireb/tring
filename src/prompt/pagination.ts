import { input } from "./input";

export type PaginationAction = "continue" | "quit";

export function parsePaginationAction(value: string): PaginationAction {
	return value.trim().toLowerCase() === "q" ? "quit" : "continue";
}

export async function paginationPrompt(): Promise<PaginationAction> {
	const answer = await input({
		message: "Press ↵ Enter to continue , q Quit",
		default: "",
		validate: (value) =>
			value.trim() === "" || value.trim().toLowerCase() === "q"
				? true
				: "Press Enter to continue or q to quit.",
	});

	return parsePaginationAction(answer);
}
