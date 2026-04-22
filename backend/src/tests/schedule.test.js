import test from "node:test";
import assert from "node:assert/strict";
import { calculateDurationDays } from "../services/durationService.js";
import { hasCycle } from "../services/scheduleService.js";

test("duration calculator rounds up correctly", () => {
  assert.equal(calculateDurationDays(150, 50), 3);
  assert.equal(calculateDurationDays(151, 50), 4);
});

test("cycle detection identifies simple cycle", () => {
  const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const deps = [
    { task_id: 2, depends_on_task_id: 1 },
    { task_id: 3, depends_on_task_id: 2 },
    { task_id: 1, depends_on_task_id: 3 }
  ];
  assert.equal(hasCycle(tasks, deps), true);
});

test("cycle detection passes for acyclic graph", () => {
  const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const deps = [
    { task_id: 2, depends_on_task_id: 1 },
    { task_id: 3, depends_on_task_id: 2 }
  ];
  assert.equal(hasCycle(tasks, deps), false);
});
