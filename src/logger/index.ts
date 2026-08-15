import { createConsola } from "consola";

/**
 * Shared logger instance used across Tring.
 */
export const log = createConsola({
	// level: 4,
	// fancy: true | false
	formatOptions: {
		//   columns: 80,
		//   colors: false,
		//   compact: false,
		date: false,
	},
});
