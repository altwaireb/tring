export interface TranslationPage<T> {
	items: T[];
	shown: number;
	total: number;
	hasNext: boolean;
}

/** Returns a page of translation items with pagination metadata. */
export function getTranslationPage<T>(
	items: readonly T[],
	page: number,
	pageSize: number,
): TranslationPage<T> {
	const total = items.length;
	const start = page * pageSize;
	const pageItems = items.slice(start, start + pageSize);
	const shown = Math.min(start + pageItems.length, total);

	return {
		items: pageItems,
		shown,
		total,
		hasNext: shown < total,
	};
}
