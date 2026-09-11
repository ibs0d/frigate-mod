import { describe, expect, it } from "vitest";

import { isFitToScreenEnabled, isVahtaRole } from "./use-is-vahta-role";

describe("isVahtaRole", () => {
  it.each(["vahta", "night_vahta", "VaHtA-supervisor"])(
    "matches the vahta substring in %s regardless of case",
    (role) => {
      expect(isVahtaRole(role)).toBe(true);
    },
  );

  it.each(["viewer", "admin", "vachta", "", null, undefined])(
    "does not match %s",
    (role) => {
      expect(isVahtaRole(role)).toBe(false);
    },
  );
});

describe("isFitToScreenEnabled", () => {
  it("enables fit-to-screen for a vahta role despite a disabled preference", () => {
    expect(isFitToScreenEnabled(true, false)).toBe(true);
  });

  it.each([true, false, undefined])(
    "keeps the persisted preference %s for other roles",
    (preference) => {
      expect(isFitToScreenEnabled(false, preference)).toBe(preference);
    },
  );
});
