import { query } from "../db/client.js";

export async function updateProjectCompletion(projectId) {
  const { rows } = await query(
    `
    SELECT COALESCE(SUM(duration * completion_percent), 0) AS weighted_done,
           COALESCE(SUM(duration), 0) AS total_duration
    FROM tasks
    WHERE project_id = $1
    `,
    [projectId]
  );
  const weightedDone = Number(rows[0].weighted_done);
  const totalDuration = Number(rows[0].total_duration);
  const completion = totalDuration > 0 ? weightedDone / totalDuration : 0;

  await query(
    `UPDATE projects SET completion_percent = $1, updated_at = NOW() WHERE id = $2`,
    [completion, projectId]
  );

  return completion;
}
