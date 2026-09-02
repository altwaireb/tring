import { loadConfig } from "c12";

import type { TringConfig } from "./types";

/** Loads the Tring configuration from the project. */
export async function loadTringConfig() {
	return loadConfig<TringConfig>({
		name: "tring",
	});
}
