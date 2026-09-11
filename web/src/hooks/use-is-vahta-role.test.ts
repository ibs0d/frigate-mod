import { describe, expect, it } from "vitest";

import { isAppFullscreen, isVahtaRole } from "./use-is-vahta-role";

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

describe("isAppFullscreen", () => {
  it("enables app fullscreen for a vahta role", () => {
    expect(isAppFullscreen(true, false)).toBe(true);
  });

  it.each([true, false])(
    "keeps browser fullscreen state %s for other roles",
    (browserFullscreen) => {
      expect(isAppFullscreen(false, browserFullscreen)).toBe(browserFullscreen);
    },
  );
});
