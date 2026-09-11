import { describe, expect, it } from "vitest";

import { isVahtaRole } from "./use-is-vahta-role";

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
