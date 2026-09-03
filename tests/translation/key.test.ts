import { describe, expect, it } from "vitest";

import { TranslationKeyRule } from "@/config";
import { isTranslationKey } from "@/translation";

describe("isTranslationKey", () => {
	describe("alpha", () => {
		it.each(["user", "userProfile", "USERPROFILE"])(
			"accepts valid translation key: %s",
			(key) => {
				expect(isTranslationKey(key, TranslationKeyRule.alpha)).toBe(true);
			},
		);

		it.each(["", "user2", "user_2", "user-2", "123user", "user profile"])(
			"rejects invalid translation key: %s",
			(key) => {
				expect(isTranslationKey(key, TranslationKeyRule.alpha)).toBe(false);
			},
		);
	});

	describe("alphaNumeric", () => {
		it.each(["user", "user2", "2FA", "123user", "APIV2"])(
			"accepts valid translation key: %s",
			(key) => {
				expect(isTranslationKey(key, TranslationKeyRule.alphaNumeric)).toBe(
					true,
				);
			},
		);

		it.each(["", "user_2", "user-2", "user profile", "user.profile"])(
			"rejects invalid translation key: %s",
			(key) => {
				expect(isTranslationKey(key, TranslationKeyRule.alphaNumeric)).toBe(
					false,
				);
			},
		);
	});

	describe("alphaDash", () => {
		it.each([
			"user",
			"user2",
			"2FA",
			"user_profile",
			"user-2-profile",
			"API_V2",
		])("accepts valid translation key: %s", (key) => {
			expect(isTranslationKey(key, TranslationKeyRule.alphaDash)).toBe(true);
		});

		it.each([
			"",
			"_user",
			"user_",
			"-user",
			"user-",
			"user.profile",
			"user profile",
		])("rejects invalid translation key: %s", (key) => {
			expect(isTranslationKey(key, TranslationKeyRule.alphaDash)).toBe(false);
		});
	});

	describe("ascii", () => {
		it.each([
			"user",
			"2FA",
			"user-profile",
			"user@profile",
			"#",
			"16digitsRandomString",
		])("accepts valid translation key: %s", (key) => {
			expect(isTranslationKey(key, TranslationKeyRule.ascii)).toBe(true);
		});

		it.each(["", "user profile", "مرحبا", "ユーザー", "用户"])(
			"rejects invalid translation key: %s",
			(key) => {
				expect(isTranslationKey(key, TranslationKeyRule.ascii)).toBe(false);
			},
		);
	});

	describe("asciiSpaces", () => {
		it.each([
			"user",
			"2FA",
			"user profile",
			"user @ profile",
			"#",
			"hello world!",
		])("accepts valid translation key: %s", (key) => {
			expect(isTranslationKey(key, TranslationKeyRule.asciiSpaces)).toBe(true);
		});

		it.each(["", "مرحبا", "ユーザー", "用户"])(
			"rejects invalid translation key: %s",
			(key) => {
				expect(isTranslationKey(key, TranslationKeyRule.asciiSpaces)).toBe(
					false,
				);
			},
		);
	});

	describe("default rule", () => {
		it("uses alphaDash when no rule is provided", () => {
			expect(isTranslationKey("2FA")).toBe(true);
			expect(isTranslationKey("_user")).toBe(false);
			expect(isTranslationKey("user-")).toBe(false);
		});
	});
});
