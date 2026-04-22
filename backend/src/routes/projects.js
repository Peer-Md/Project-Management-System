import express from "express";
import { query } from "../db/client.js";
import { createProjectSchema, createTaskSchema } from "../validation.js";
import { calculateDurationDays } from "../services/durationService.js";
import { addDays, formatISODate, parseISODate } from "../services/dateUtils.js";
import { getTemplateTasks } from "../services/templateService.js";
import {
  getCriticalPathTaskIds,
  recalculateSchedule,
  validateDependencyInsert
} from "../services/scheduleService.js";
import { updateProjectCompletion } from "../services/progressService.js";

const router = express.Router();

router.post("/projects", async (req, res) => {
  const input = createProjectSchema.parse(req.body);
  const result = await query(
    `INSERT INTO projects (name, floors, type) VALUES ($1, $2, $3) RETURNING *`,
    [input.name, input.floors, input.type]
  );
  res.status(201).json(result.rows[0]);
});

router.get("/projects", async (_req, res) => {
  const result = await query(`SELECT * FROM projects ORDER BY id DESC`);
  res.json(result.rows);
});

router.get("/projects/:id", async (req, res) => {
  const projectId = Number(req.params.id);
  const project = await query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
  const tasks = await query(`SELECT * FROM tasks WHERE project_id = $1 ORDER BY start_date, id`, [projectId]);
  res.json({ project: project.rows[0] || null, tasks: tasks.rows });
});

router.post("/projects/:id/tasks", async (req, res) => {
  const projectId = Number(req.params.id);
  const input = createTaskSchema.parse(req.body);
  const duration =
    input.quantity && input.productivityRate
      ? calculateDurationDays(input.quantity, input.productivityRate)
      : 1;
  const endDate = input.endDate || formatISODate(addDays(parseISODate(input.startDate), duration - 1));
  const result = await query(
    `INSERT INTO tasks (
      project_id, name, mep_type, floor, start_date, end_date, duration,
      quantity, productivity_rate, status, completion_percent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
      projectId,
      input.name,
      input.mepType,
      input.floor,
      input.startDate,
      endDate,
      duration,
      input.quantity || 0,
      input.productivityRate || 0,
      input.status,
      input.completionPercent
    ]
  );
  await updateProjectCompletion(projectId);
  res.status(201).json(result.rows[0]);
});

router.get("/projects/:id/tasks", async (req, res) => {
  const projectId = Number(req.params.id);
  const result = await query(`SELECT * FROM tasks WHERE project_id = $1 ORDER BY start_date, id`, [projectId]);
  res.json(result.rows);
});

router.patch("/projects/:projectId/tasks/:taskId", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  const payload = req.body;
  const allowed = ["name", "floor", "start_date", "end_date", "status", "completion_percent"];
  const sets = [];
  const values = [];
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      values.push(payload[key]);
      sets.push(`${key} = $${values.length}`);
    }
  }
  if (!sets.length) return res.status(400).json({ message: "No updatable fields provided" });
  values.push(taskId);
  const updated = await query(
    `UPDATE tasks SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  await recalculateSchedule(projectId);
  await updateProjectCompletion(projectId);
  res.json(updated.rows[0]);
});

router.post("/projects/:id/templates/:mepType/apply", async (req, res) => {
  const projectId = Number(req.params.id);
  const mepType = req.params.mepType;
  const { floor = "L1", startDate = "2026-05-01" } = req.body || {};
  const names = getTemplateTasks(mepType);
  if (!names.length) return res.status(400).json({ message: "Unsupported MEP template" });

  let cursorDate = parseISODate(startDate);
  const createdTaskIds = [];
  for (const name of names) {
    const start = formatISODate(cursorDate);
    const end = formatISODate(addDays(cursorDate, 1));
    const inserted = await query(
      `INSERT INTO tasks (
        project_id, name, mep_type, floor, start_date, end_date, duration, status, completion_percent
      ) VALUES ($1,$2,$3,$4,$5,$6,2,'Not Started',0) RETURNING id`,
      [projectId, name, mepType, floor, start, end]
    );
    createdTaskIds.push(inserted.rows[0].id);
    cursorDate = addDays(cursorDate, 2);
  }

  for (let i = 1; i < createdTaskIds.length; i += 1) {
    await query(
      `INSERT INTO dependencies (task_id, depends_on_task_id) VALUES ($1, $2)`,
      [createdTaskIds[i], createdTaskIds[i - 1]]
    );
  }

  res.status(201).json({ createdTaskIds });
});

router.get("/projects/:id/gantt", async (req, res) => {
  const projectId = Number(req.params.id);
  const { floor, mepType } = req.query;
  const clauses = ["t.project_id = $1"];
  const params = [projectId];
  if (floor) {
    params.push(floor);
    clauses.push(`t.floor = $${params.length}`);
  }
  if (mepType) {
    params.push(mepType);
    clauses.push(`t.mep_type = $${params.length}`);
  }
  const tasks = await query(
    `SELECT t.* FROM tasks t WHERE ${clauses.join(" AND ")} ORDER BY t.floor, t.mep_type, t.start_date, t.id`,
    params
  );
  const dependencies = await query(
    `SELECT d.* FROM dependencies d
     JOIN tasks t ON t.id = d.task_id
     WHERE t.project_id = $1`,
    [projectId]
  );
  const criticalPathTaskIds = await getCriticalPathTaskIds(projectId);
  res.json({
    tasks: tasks.rows,
    dependencies: dependencies.rows,
    criticalPathTaskIds
  });
});

router.post("/tasks/:id/dependencies", async (req, res) => {
  const taskId = Number(req.params.id);
  const dependsOnTaskId = Number(req.body.dependsOnTaskId);
  const projectLookup = await query(`SELECT project_id FROM tasks WHERE id = $1`, [taskId]);
  if (!projectLookup.rows[0]) return res.status(404).json({ message: "Task not found" });
  const projectId = Number(projectLookup.rows[0].project_id);
  const valid = await validateDependencyInsert(taskId, dependsOnTaskId, projectId);
  if (!valid) return res.status(400).json({ message: "Circular dependency detected" });
  const result = await query(
    `INSERT INTO dependencies (task_id, depends_on_task_id) VALUES ($1, $2) RETURNING *`,
    [taskId, dependsOnTaskId]
  );
  await recalculateSchedule(projectId);
  res.status(201).json(result.rows[0]);
});

router.delete("/tasks/:taskId/dependencies/:dependsOnTaskId", async (req, res) => {
  const taskId = Number(req.params.taskId);
  const dependsOnTaskId = Number(req.params.dependsOnTaskId);
  await query(`DELETE FROM dependencies WHERE task_id = $1 AND depends_on_task_id = $2`, [taskId, dependsOnTaskId]);
  res.status(204).send();
});

router.post("/tasks/:id/resources", async (req, res) => {
  const taskId = Number(req.params.id);
  const { role, quantity } = req.body;
  const result = await query(
    `INSERT INTO resources (task_id, role, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (task_id, role)
     DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()
     RETURNING *`,
    [taskId, role, quantity]
  );
  res.status(201).json(result.rows[0]);
});

router.put("/tasks/:id/resources", async (req, res) => {
  const taskId = Number(req.params.id);
  const resources = req.body.resources || [];
  await query(`DELETE FROM resources WHERE task_id = $1`, [taskId]);
  for (const resource of resources) {
    await query(`INSERT INTO resources (task_id, role, quantity) VALUES ($1, $2, $3)`, [
      taskId,
      resource.role,
      resource.quantity
    ]);
  }
  const result = await query(`SELECT * FROM resources WHERE task_id = $1 ORDER BY id`, [taskId]);
  res.json(result.rows);
});

export default router;
