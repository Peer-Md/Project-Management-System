CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  floors VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Residential', 'Commercial')),
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
