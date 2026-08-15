import { describe, expect, it } from "vitest";

import { isTranslationKey } from "@/translation";

describe("isTranslationKey", () => {
	it.each([
		"user",
		"userProfile",
		"user_profile",
		"user-profile",
		"USER_PROFILE",
		"USER-PROFILE",
		"user2",
		"user_2_profile",
		"user-2-profile",
		"API_V2",
		"api-v2",
	])("accepts valid translation key: %s", (key) => {
		expect(isTranslationKey(key)).toBe(true);
	});

	it.each([
		"",
		"123user",
		"_user",
		"user_",
		"-user",
		"user-",
		"user.profile",
		"user profile",
		"user@profile",
		"user/profile",
		"user\\profile",
		"user:profile",
		"مرحبا",
		"ユーザー",
		"用户",
	])("rejects invalid translation key: %s", (key) => {
		expect(isTranslationKey(key)).toBe(false);
	});
});
