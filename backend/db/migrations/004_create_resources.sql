CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_task_role UNIQUE (task_id, role)
);

CREATE INDEX IF NOT EXISTS idx_resources_task_id ON resources(task_id);
