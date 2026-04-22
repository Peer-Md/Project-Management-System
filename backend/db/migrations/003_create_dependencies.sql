CREATE TABLE IF NOT EXISTS dependencies (
  id SERIAL PRIMARY KEY,
  task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_no_self_dependency CHECK (task_id <> depends_on_task_id),
  CONSTRAINT uq_dependency_pair UNIQUE (task_id, depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_dependencies_task_id ON dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_depends_on_task_id ON dependencies(depends_on_task_id);
