import { CONFIG_FILE } from "@/constants";
import { exists, write } from "@/filesystem";
import { logger } from "@/logger";

import { createConfigTemplate } from "./template";

interface InitOptions {
	force: boolean;
}

export async function runInit(options: InitOptions) {
	const fileExists = await exists(CONFIG_FILE);

	if (fileExists && !options.force) {
		logger.error(`${CONFIG_FILE} already exists.`);
		return;
	}

	await write(CONFIG_FILE, createConfigTemplate());

	if (fileExists) {
		logger.success(`Overwritten ${CONFIG_FILE}`);
		return;
	}

	logger.success(`Created ${CONFIG_FILE}`);
}
