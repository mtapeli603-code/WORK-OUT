import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getNextReminderDate, isReminderDue, normalizeReminderDays } from "./workout-reminders";

describe("reminder helpers", () => {
  it("normalizes and deduplicates reminder days in weekday order", () => {
    assert.deepEqual(normalizeReminderDays(["sun", "MON", "wed", "MON", "fri", "something"]), ["MON", "WED", "FRI", "SUN"]);
  });

  it("returns true only when the current day and time match the reminder window", () => {
    const now = new Date(2026, 9, 5, 9, 15); // Monday
    assert.equal(isReminderDue({ enabled: true, time: "09:00", days: ["MON"], now }), true);
    assert.equal(isReminderDue({ enabled: true, time: "09:00", days: ["TUE"], now }), false);
    assert.equal(isReminderDue({ enabled: false, time: "09:00", days: ["MON"], now }), false);
  });

  it("calculates the next reminder date after the current time", () => {
    const beforeDue = new Date(2026, 9, 5, 8, 30); // Monday before 09:00
    const afterDue = new Date(2026, 9, 5, 10, 15); // Monday after 09:00

    const upcoming = getNextReminderDate({ days: ["MON", "WED"], time: "09:00", now: beforeDue });
    assert.equal(upcoming?.getDay(), 1);
    assert.equal(upcoming?.getHours(), 9);

    const nextDay = getNextReminderDate({ days: ["MON", "WED"], time: "09:00", now: afterDue });
    assert.equal(nextDay?.getDay(), 3);
    assert.equal(nextDay?.getHours(), 9);
  });
});
