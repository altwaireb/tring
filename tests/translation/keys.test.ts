import { describe, expect, it } from "vitest";

import { extractTranslationKeys } from "@/translation";

describe("extractTranslationKeys", () => {
	it("extracts top-level translation keys", () => {
		const document = {
			welcome: "Welcome",
			login: "Login",
		};

		expect(extractTranslationKeys(document)).toEqual(["welcome", "login"]);
	});

	it("extracts nested translation keys", () => {
		const document = {
			auth: {
				login: {
					title: "Login",
					button: "Sign in",
				},
			},
		};

		expect(extractTranslationKeys(document)).toEqual([
			"auth.login.title",
			"auth.login.button",
		]);
	});

	it("supports snake_case and kebab-case keys", () => {
		const document = {
			user_profile: {
				first_name: "First name",
				"last-name": "Last name",
			},
		};

		expect(extractTranslationKeys(document)).toEqual([
			"user_profile.first_name",
			"user_profile.last-name",
		]);
	});

	it("rejects invalid translation keys", () => {
		const document = {
			"user.profile": "User profile",
		};

		expect(() => extractTranslationKeys(document)).toThrow(
			'Invalid translation key: "user.profile".',
		);
	});

	it("rejects boolean values", () => {
		const document = {
			enabled: true,
		};

		expect(() => extractTranslationKeys(document)).toThrow(
			'Invalid translation value at "enabled".',
		);
	});

	it("rejects number values", () => {
		const document = {
			retry_count: 3,
		};

		expect(() => extractTranslationKeys(document)).toThrow(
			'Invalid translation value at "retry_count".',
		);
	});

	it("rejects null values", () => {
		const document = {
			description: null,
		};

		expect(() => extractTranslationKeys(document)).toThrow(
			'Invalid translation value at "description".',
		);
	});

	it("rejects arrays", () => {
		const document = {
			days: ["Monday", "Tuesday"],
		};

		expect(() => extractTranslationKeys(document)).toThrow(
			'Invalid translation value at "days".',
		);
	});
});
