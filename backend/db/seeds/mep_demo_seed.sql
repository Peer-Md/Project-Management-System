INSERT INTO projects (name, floors, type)
VALUES ('Tower A MEP Fitout', 'G+5', 'Commercial')
RETURNING id;

-- Use psql variable or replace manually as needed
-- \set project_id 1

INSERT INTO tasks (project_id, name, mep_type, floor, start_date, end_date, duration, quantity, productivity_rate, status, completion_percent)
VALUES
  (1, 'Cable Tray Installation', 'Electrical', 'L1', '2026-05-01', '2026-05-03', 3, 150, 50, 'In Progress', 35),
  (1, 'Conduit Work', 'Electrical', 'L1', '2026-05-04', '2026-05-06', 3, 120, 40, 'Not Started', 0),
  (1, 'Cable Pulling', 'Electrical', 'L1', '2026-05-07', '2026-05-09', 3, 150, 50, 'Not Started', 0),
  (1, 'Duct Installation', 'HVAC', 'L2', '2026-05-02', '2026-05-05', 4, 200, 50, 'In Progress', 25),
  (1, 'AHU Installation', 'HVAC', 'L2', '2026-05-06', '2026-05-07', 2, 2, 1, 'Not Started', 0),
  (1, 'Pipe Routing', 'Plumbing', 'L1', '2026-05-03', '2026-05-06', 4, 100, 25, 'Not Started', 0);

INSERT INTO dependencies (task_id, depends_on_task_id)
VALUES
  (2, 1),
  (3, 2),
  (5, 4);

INSERT INTO resources (task_id, role, quantity)
VALUES
  (1, 'Electrician', 4),
  (1, 'Helper', 2),
  (4, 'Duct Fabricator', 3),
  (6, 'Plumber', 2);
