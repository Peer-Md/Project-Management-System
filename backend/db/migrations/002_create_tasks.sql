CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  mep_type VARCHAR(50) NOT NULL CHECK (mep_type IN ('Electrical', 'HVAC', 'Plumbing')),
  floor VARCHAR(30) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INT NOT NULL CHECK (duration >= 1),
  quantity NUMERIC(12,2) DEFAULT 0,
  productivity_rate NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_floor_mep ON tasks(project_id, floor, mep_type);
