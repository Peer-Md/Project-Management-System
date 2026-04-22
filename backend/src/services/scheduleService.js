import { query } from "../db/client.js";
import { addDays, formatISODate, parseISODate } from "./dateUtils.js";

function buildAdjacency(tasks, dependencies) {
  const adjacency = new Map();
  const inDegree = new Map();
  for (const task of tasks) {
    adjacency.set(task.id, []);
    inDegree.set(task.id, 0);
  }
  for (const dep of dependencies) {
    adjacency.get(dep.depends_on_task_id)?.push(dep.task_id);
    inDegree.set(dep.task_id, (inDegree.get(dep.task_id) || 0) + 1);
  }
  return { adjacency, inDegree };
}

export function hasCycle(tasks, dependencies) {
  const { adjacency, inDegree } = buildAdjacency(tasks, dependencies);
  const queue = [];
  for (const [node, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(node);
  }
  let visited = 0;
  while (queue.length) {
    const node = queue.shift();
    visited += 1;
    for (const child of adjacency.get(node) || []) {
      inDegree.set(child, inDegree.get(child) - 1);
      if (inDegree.get(child) === 0) queue.push(child);
    }
  }
  return visited !== tasks.length;
}

export async function validateDependencyInsert(taskId, dependsOnTaskId, projectId) {
  const tasksRes = await query(`SELECT id FROM tasks WHERE project_id = $1`, [projectId]);
  const depsRes = await query(
    `SELECT task_id, depends_on_task_id FROM dependencies WHERE task_id IN (SELECT id FROM tasks WHERE project_id = $1)`,
    [projectId]
  );
  const tasks = tasksRes.rows;
  const deps = [...depsRes.rows, { task_id: taskId, depends_on_task_id: dependsOnTaskId }];
  return !hasCycle(tasks, deps);
}

export async function recalculateSchedule(projectId) {
  const tasksRes = await query(
    `SELECT id, start_date, end_date, duration FROM tasks WHERE project_id = $1 ORDER BY id`,
    [projectId]
  );
  const depsRes = await query(
    `SELECT d.task_id, d.depends_on_task_id
     FROM dependencies d
     JOIN tasks t ON t.id = d.task_id
     WHERE t.project_id = $1`,
    [projectId]
  );
  const tasks = tasksRes.rows;
  const deps = depsRes.rows;
  const dependsMap = new Map();
  for (const task of tasks) dependsMap.set(task.id, []);
  for (const dep of deps) dependsMap.get(dep.task_id)?.push(dep.depends_on_task_id);

  for (const task of tasks) {
    const parentIds = dependsMap.get(task.id) || [];
    if (!parentIds.length) continue;
    const parentRes = await query(
      `SELECT MAX(end_date) AS latest_end FROM tasks WHERE id = ANY($1::int[])`,
      [parentIds]
    );
    const latestEnd = parentRes.rows[0].latest_end;
    if (!latestEnd) continue;

    const adjustedStart = addDays(parseISODate(formatISODate(latestEnd)), 1);
    const adjustedEnd = addDays(adjustedStart, Number(task.duration) - 1);
    await query(
      `UPDATE tasks
       SET start_date = $1, end_date = $2, updated_at = NOW()
       WHERE id = $3`,
      [formatISODate(adjustedStart), formatISODate(adjustedEnd), task.id]
    );
  }
}

export async function getCriticalPathTaskIds(projectId) {
  const tasksRes = await query(
    `SELECT id, duration FROM tasks WHERE project_id = $1 ORDER BY id`,
    [projectId]
  );
  const depsRes = await query(
    `SELECT d.task_id, d.depends_on_task_id
     FROM dependencies d
     JOIN tasks t ON t.id = d.task_id
     WHERE t.project_id = $1`,
    [projectId]
  );
  const tasks = tasksRes.rows;
  if (!tasks.length) return [];
  const durationById = new Map(tasks.map((t) => [t.id, Number(t.duration)]));
  const parents = new Map(tasks.map((t) => [t.id, []]));
  for (const dep of depsRes.rows) parents.get(dep.task_id).push(dep.depends_on_task_id);

  const memo = new Map();
  function longest(nodeId) {
    if (memo.has(nodeId)) return memo.get(nodeId);
    const options = parents.get(nodeId) || [];
    let best = { len: durationById.get(nodeId), path: [nodeId] };
    for (const parent of options) {
      const parentPath = longest(parent);
      const candidate = { len: parentPath.len + durationById.get(nodeId), path: [...parentPath.path, nodeId] };
      if (candidate.len > best.len) best = candidate;
    }
    memo.set(nodeId, best);
    return best;
  }
  let finalBest = { len: -1, path: [] };
  for (const task of tasks) {
    const chain = longest(task.id);
    if (chain.len > finalBest.len) finalBest = chain;
  }
  return finalBest.path;
}
