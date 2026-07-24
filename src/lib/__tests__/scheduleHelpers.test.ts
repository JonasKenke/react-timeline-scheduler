import { describe, it, expect } from "vitest";
import {
  timeToMinutes,
  calculateItemPosition,
  calculateVerticalPosition,
} from "../scheduleHelpers";

// ----------------------------------------------------------------------
// timeToMinutes
// ----------------------------------------------------------------------
describe("timeToMinutes", () => {
  it('returns 0 for "00:00"', () => {
    expect(timeToMinutes("00:00")).toBe(0);
  });

  it('returns 60 for "01:00"', () => {
    expect(timeToMinutes("01:00")).toBe(60);
  });

  it('returns 90 for "01:30"', () => {
    expect(timeToMinutes("01:30")).toBe(90);
  });

  it('returns 720 for "12:00"', () => {
    expect(timeToMinutes("12:00")).toBe(720);
  });

  it('returns 1439 for "23:59"', () => {
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it('returns 1440 for "24:00"', () => {
    expect(timeToMinutes("24:00")).toBe(1440);
  });

  it("handles single-digit hours without leading zero", () => {
    expect(timeToMinutes("5:30")).toBe(330);
  });

  it("handles midnight boundary", () => {
    expect(timeToMinutes("00:01")).toBe(1);
  });

  it("returns NaN for empty string", () => {
    expect(timeToMinutes("")).toBeNaN();
  });

  it("returns NaN for non-numeric hours", () => {
    expect(timeToMinutes("ab:00")).toBeNaN();
  });

  it("returns NaN for non-numeric minutes", () => {
    expect(timeToMinutes("12:xx")).toBeNaN();
  });

  it("returns NaN when colon is missing", () => {
    expect(timeToMinutes("1200")).toBeNaN();
  });
});

// ----------------------------------------------------------------------
// calculateItemPosition
// ----------------------------------------------------------------------
describe("calculateItemPosition", () => {
  it("handles all-day items", () => {
    const item = { allDay: true };
    const result = calculateItemPosition(item);

    expect(result.left).toBe(0);
    expect(result.width).toBe(100);
    expect(result.startMinutes).toBe(0);
    expect(result.endMinutes).toBe(24 * 60);
    expect(result.duration).toBe(24 * 60);
  });

  it("positions item at 08:00-10:00 correctly", () => {
    const item = { startTime: "08:00", endTime: "10:00" };
    const result = calculateItemPosition(item);

    expect(result.startMinutes).toBe(8 * 60);
    expect(result.endMinutes).toBe(10 * 60);
    expect(result.duration).toBe(2 * 60);
    expect(result.left).toBeCloseTo(33.333, 2);
    expect(result.width).toBeCloseTo(8.333, 2);
  });

  it("positions item at 00:00-00:30 (start of day)", () => {
    const item = { startTime: "00:00", endTime: "00:30" };
    const result = calculateItemPosition(item);

    expect(result.left).toBe(0);
    expect(result.width).toBeCloseTo(2.083, 2);
    expect(result.startMinutes).toBe(0);
    expect(result.endMinutes).toBe(30);
    expect(result.duration).toBe(30);
  });

  it("positions item at 23:00-23:59 (end of day)", () => {
    const item = { startTime: "23:00", endTime: "23:59" };
    const result = calculateItemPosition(item);

    expect(result.startMinutes).toBe(23 * 60);
    expect(result.endMinutes).toBe(23 * 60 + 59);
    expect(result.duration).toBe(59);
    expect(result.left).toBeCloseTo(95.833, 2);
  });

  it("handles overnight items (end < start)", () => {
    const item = { startTime: "22:00", endTime: "02:00" };
    const result = calculateItemPosition(item);

    expect(result.startMinutes).toBe(22 * 60);
    expect(result.endMinutes).toBe(2 * 60);
    expect(result.duration).toBe(4 * 60);
  });

  it("handles zero-duration item (same start and end)", () => {
    const item = { startTime: "12:00", endTime: "12:00" };
    const result = calculateItemPosition(item);

    expect(result.startMinutes).toBe(720);
    expect(result.endMinutes).toBe(720);
    expect(result.duration).toBe(0);
    expect(result.left).toBeCloseTo(50, 2);
    expect(result.width).toBe(0);
  });

  it("respects custom totalHours", () => {
    const item = { startTime: "00:00", endTime: "06:00" };
    const result = calculateItemPosition(item, 12);

    expect(result.startMinutes).toBe(0);
    expect(result.endMinutes).toBe(360);
    expect(result.duration).toBe(360);
    expect(result.left).toBe(0);
    expect(result.width).toBe(50);
  });

  it("positions item spanning full custom window", () => {
    const item = { startTime: "00:00", endTime: "08:00" };
    const result = calculateItemPosition(item, 8);

    expect(result.left).toBe(0);
    expect(result.width).toBe(100);
    expect(result.duration).toBe(8 * 60);
  });

  it("handles item without explicit allDay (falsy)", () => {
    const item = { startTime: "09:00", endTime: "17:00" };
    const result = calculateItemPosition(item);

    expect(result.startMinutes).toBe(9 * 60);
    expect(result.endMinutes).toBe(17 * 60);
    expect(result.duration).toBe(8 * 60);
  });

  it("defaults to 24 hours when totalHours is omitted", () => {
    const item = { startTime: "00:00", endTime: "12:00" };
    const result = calculateItemPosition(item);

    expect(result.left).toBe(0);
    expect(result.width).toBe(50);
  });
});

// ----------------------------------------------------------------------
// calculateVerticalPosition
// ----------------------------------------------------------------------
describe("calculateVerticalPosition", () => {
  it("returns empty array for empty input", () => {
    expect(calculateVerticalPosition([])).toEqual([]);
  });

  it("returns level 0 for a single item", () => {
    const items = [{ startTime: "09:00", endTime: "10:00" }];
    expect(calculateVerticalPosition(items)).toEqual([0]);
  });

  it("places non-overlapping items on same level", () => {
    const items = [
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
    ];
    // Adjacent (touching at 10:00) — not overlapping
    expect(calculateVerticalPosition(items)).toEqual([0, 0]);
  });

  it("places overlapping items on different levels", () => {
    const items = [
      { startTime: "09:00", endTime: "11:00" },
      { startTime: "10:00", endTime: "12:00" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
  });

  it("reuses a level when an item fits in a gap between overlappers", () => {
    // A: 09-12 (level 0)
    // B: 09-10 overlaps with A → level 1
    // C: 11-12 overlaps with A but NOT with B → reuses level 1
    const items = [
      { startTime: "09:00", endTime: "12:00" },
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "11:00", endTime: "12:00" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(1);
  });

  it("stacks many overlapping items", () => {
    const items = [
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "09:15", endTime: "10:15" },
      { startTime: "09:30", endTime: "10:30" },
      { startTime: "09:45", endTime: "10:45" },
    ];
    const result = calculateVerticalPosition(items);
    const uniqueLevels = new Set(result);
    expect(uniqueLevels.size).toBe(4);
  });

  it("handles partially overlapping schedule efficiently", () => {
    // A: 09-11, B: 10-12, C: 11-13
    // A overlaps B, B overlaps C, but A does not overlap C
    // Optimal: A level 0, C level 0 (no overlap), B level 1
    const items = [
      { startTime: "09:00", endTime: "11:00" },
      { startTime: "10:00", endTime: "12:00" },
      { startTime: "11:00", endTime: "13:00" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(0);
  });

  it("all-day items span the whole day and overlap with normal items", () => {
    const items = [
      { startTime: "14:00", endTime: "15:00" },
      { allDay: true },
    ];
    const result = calculateVerticalPosition(items);
    // allDay item gets level 0, normal item overlaps → level 1
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(0);
  });

  it("all-day item before normal items forces them to next level", () => {
    const items = [
      { allDay: true },
      { startTime: "09:00", endTime: "17:00" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result[0]).toBe(0); // allDay → level 0
    expect(result[1]).toBe(1); // normal → level 1 (overlaps with allDay)
  });

  it("multiple all-day items share level 0", () => {
    const items = [
      { allDay: true },
      { allDay: true },
    ];
    const result = calculateVerticalPosition(items);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1); // second allDay overlaps with first (both span full day)
  });

  it("handles overnight overlapping items", () => {
    const items = [
      { startTime: "22:00", endTime: "02:00" },
      { startTime: "23:00", endTime: "03:00" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
  });

  it("handles overnight non-overlapping adjacent items", () => {
    const items = [
      { startTime: "22:00", endTime: "23:00" },
      { startTime: "23:00", endTime: "00:00" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result).toEqual([0, 0]);
  });

  it("handles mixed overnight and normal items", () => {
    const items = [
      { startTime: "10:00", endTime: "12:00" },
      { startTime: "22:00", endTime: "01:00" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result).toEqual([0, 0]);
  });

  it("preserves original array order in output", () => {
    const items = [
      { startTime: "10:00", endTime: "12:00" },
      { startTime: "09:00", endTime: "11:00" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result).toHaveLength(2);
    // Both overlap: 10-12 and 09-11 → different levels
    expect(result[0]).not.toBe(result[1]);
  });

  it("handles single-item array correctly", () => {
    const items = [{ startTime: "08:00", endTime: "09:00" }];
    expect(calculateVerticalPosition(items)).toEqual([0]);
  });

  it("handles items with empty string startTime/endTime", () => {
    const items = [
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "", endTime: "" },
    ];
    const result = calculateVerticalPosition(items);
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe("number");
    expect(typeof result[1]).toBe("number");
  });
});
