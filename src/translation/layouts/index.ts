import { TranslationLayout } from "@/config";
import type { TranslationLayoutAdapter } from "./adapter";
import { directoriesLayout } from "./directories";
import { filesLayout } from "./files";

export { directoriesLayout, filesLayout };

/**
 * Returns the adapter responsible for the configured translation layout.
 */
export function getTranslationLayoutAdapter(
	layout: TranslationLayout,
): TranslationLayoutAdapter {
	switch (layout) {
		case TranslationLayout.files:
			return filesLayout;

		case TranslationLayout.directories:
			return directoriesLayout;
	}
}
