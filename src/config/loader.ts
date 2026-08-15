import { loadConfig } from "c12";

import { pkg } from "../package";
import type { TringConfig } from "./types";

export async function loadTringConfig() {
	return loadConfig<TringConfig>({
		name: pkg.name,
	});
}
