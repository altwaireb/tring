import { describe, expect, it } from "vitest";

import {
	compareTranslationKeyNames,
	isTranslationObjectSorted,
	sortTranslationObject,
} from "@/translation";

describe("compareTranslationKeys", () => {
	it("sorts keys alphabetically", () => {
		const keys = ["title", "account", "security", "auth"];

		keys.sort(compareTranslationKeyNames);

		expect(keys).toEqual(["account", "auth", "security", "title"]);
	});

	it("sorts keys case-insensitively", () => {
		const keys = ["security", "Account", "title", "account"];

		keys.sort(compareTranslationKeyNames);

		expect(keys).toEqual(["account", "Account", "security", "title"]);
	});

	it("sorts numeric parts naturally", () => {
		const keys = ["item10", "item2", "item1", "item20"];

		keys.sort(compareTranslationKeyNames);

		expect(keys).toEqual(["item1", "item2", "item10", "item20"]);
	});

	it("sorts keys case-insensitively with lowercase first", () => {
		const keys = ["security", "Account", "title", "account"];

		keys.sort(compareTranslationKeyNames);

		expect(keys).toEqual(["account", "Account", "security", "title"]);
	});

	it("produces a deterministic order for keys that differ by case", () => {
		const keys = ["account", "ACCOUNT", "Account"];

		keys.sort(compareTranslationKeyNames);

		expect(keys).toEqual(["account", "Account", "ACCOUNT"]);
	});
});

describe("sortTranslationObject", () => {
	it("sorts top-level keys", () => {
		const object = {
			title: "Settings",
			security: "Security",
			account: "Account",
			auth: "Authentication",
		};

		expect(sortTranslationObject(object)).toEqual({
			account: "Account",
			auth: "Authentication",
			security: "Security",
			title: "Settings",
		});
	});

	it("sorts nested objects recursively", () => {
		const object = {
			settings: {
				title: "Settings",
				account: {
					title: "Account",
					email: "Email",
				},
			},
			auth: {
				logout: "Logout",
				login: "Login",
			},
		};

		expect(sortTranslationObject(object)).toEqual({
			auth: {
				login: "Login",
				logout: "Logout",
			},
			settings: {
				account: {
					email: "Email",
					title: "Account",
				},
				title: "Settings",
			},
		});
	});

	it("sorts numeric keys naturally", () => {
		const object = {
			item10: "Ten",
			item2: "Two",
			item1: "One",
			item20: "Twenty",
		};

		expect(sortTranslationObject(object)).toEqual({
			item1: "One",
			item2: "Two",
			item10: "Ten",
			item20: "Twenty",
		});
	});

	it("preserves translation values", () => {
		const object = {
			title: "Settings",
			account: {
				email: "Email",
				title: "Account",
			},
			count: 10,
			enabled: true,
			value: null,
		};

		expect(sortTranslationObject(object)).toEqual({
			account: {
				email: "Email",
				title: "Account",
			},
			count: 10,
			enabled: true,
			title: "Settings",
			value: null,
		});
	});

	it("does not sort arrays", () => {
		const object = {
			roles: ["admin", "editor", "user"],
			settings: {
				title: "Settings",
				email: "Email",
			},
		};

		expect(sortTranslationObject(object)).toEqual({
			roles: ["admin", "editor", "user"],
			settings: {
				email: "Email",
				title: "Settings",
			},
		});
	});

	it("returns an already sorted object with the same key order", () => {
		const object = {
			account: {
				email: "Email",
				title: "Account",
			},
			auth: {
				login: "Login",
				logout: "Logout",
			},
			title: "Settings",
		};

		expect(sortTranslationObject(object)).toEqual(object);
	});
});

describe("isTranslationObjectSorted", () => {
	it("returns true for a sorted object", () => {
		const object = {
			account: "Account",
			auth: "Authentication",
			security: "Security",
			title: "Settings",
		};

		expect(isTranslationObjectSorted(object)).toBe(true);
	});

	it("returns false for an unsorted object", () => {
		const object = {
			title: "Settings",
			account: "Account",
			security: "Security",
		};

		expect(isTranslationObjectSorted(object)).toBe(false);
	});

	it("validates nested objects recursively", () => {
		const object = {
			account: {
				email: "Email",
				title: "Account",
			},
			settings: {
				account: {
					email: "Email",
					title: "Account",
				},
				title: "Settings",
			},
		};

		expect(isTranslationObjectSorted(object)).toBe(true);
	});

	it("returns false when a nested object is unsorted", () => {
		const object = {
			account: {
				email: "Email",
				title: "Account",
			},
			settings: {
				title: "Settings",
				account: {
					title: "Account",
					email: "Email",
				},
			},
		};

		expect(isTranslationObjectSorted(object)).toBe(false);
	});

	it("uses natural numeric ordering", () => {
		const sorted = {
			item1: "One",
			item2: "Two",
			item10: "Ten",
		};

		const unsorted = {
			item1: "One",
			item10: "Ten",
			item2: "Two",
		};

		expect(isTranslationObjectSorted(sorted)).toBe(true);
		expect(isTranslationObjectSorted(unsorted)).toBe(false);
	});

	it("uses case-insensitive ordering with lowercase first", () => {
		const sorted = {
			account: "Account",
			Account: "Account",
			ACCOUNT: "Account",
		};

		const unsorted = {
			ACCOUNT: "Account",
			Account: "Account",
			account: "Account",
		};

		expect(isTranslationObjectSorted(sorted)).toBe(true);
		expect(isTranslationObjectSorted(unsorted)).toBe(false);
	});
});
