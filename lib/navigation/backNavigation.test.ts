import { describe, expect, it } from "vitest";
import {
  getBackNavigationTarget,
  shouldConfirmExitOnBack,
} from "./backNavigation";

describe("getBackNavigationTarget", () => {
  it("returns list path for detail pages", () => {
    expect(getBackNavigationTarget("/staff/board/12")).toBe("/staff/board");
    expect(getBackNavigationTarget("/info/events/7")).toBe("/info/events");
    expect(getBackNavigationTarget("/requests/class/15/proposals")).toBe("/requests/class");
  });

  it("returns main page for top-level section pages", () => {
    expect(getBackNavigationTarget("/staff/board")).toBe("/");
    expect(getBackNavigationTarget("/requests/payment")).toBe("/");
    expect(getBackNavigationTarget("/info/events")).toBe("/");
    expect(getBackNavigationTarget("/info/history")).toBe("/");
    expect(getBackNavigationTarget("/info/classes")).toBe("/");
  });

  it("returns section root for nested staff pages", () => {
    expect(getBackNavigationTarget("/staff/class-management/class-journal/new")).toBe(
      "/staff/class-management/class-journal",
    );
    expect(getBackNavigationTarget("/staff/archive/meeting-records/3")).toBe(
      "/staff/archive/meeting-records",
    );
  });

  it("returns null for the home page", () => {
    expect(getBackNavigationTarget("/")).toBeNull();
  });
});

describe("shouldConfirmExitOnBack", () => {
  it("only confirms exit on the mobile home page", () => {
    expect(shouldConfirmExitOnBack("/", true)).toBe(true);
    expect(shouldConfirmExitOnBack("/", false)).toBe(false);
    expect(shouldConfirmExitOnBack("/staff/board", true)).toBe(false);
  });
});
