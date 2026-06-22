import { describe, expect, it } from "vitest";
import { calculateDistanceMeters, isWithinAttendanceRange } from "./attendanceLocation";

describe("attendanceLocation", () => {
  it("returns near-zero distance for identical coordinates", () => {
    expect(calculateDistanceMeters(35.2432, 129.0923, 35.2432, 129.0923)).toBeCloseTo(0, 5);
  });

  it("detects whether the user is inside the allowed radius", () => {
    const withinRange = isWithinAttendanceRange(
      35.2432,
      129.0923,
      35.2433,
      129.0924,
      20,
    );
    const outsideRange = isWithinAttendanceRange(
      35.2432,
      129.0923,
      35.2445,
      129.094,
      20,
    );

    expect(withinRange).toBe(true);
    expect(outsideRange).toBe(false);
  });
});
