DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'todo_status') THEN
        CREATE TYPE todo_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_permission') THEN
        CREATE TYPE access_permission AS ENUM ('EDIT', 'VIEW');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'todo_priority') THEN
        CREATE TYPE todo_priority AS ENUM ('P0', 'P1', 'P2', 'P3');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('PENDING', 'ACCEPTED');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todo_lists (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES todo_lists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status todo_status DEFAULT 'NOT_STARTED',
  priority todo_priority DEFAULT 'P1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todo_list_access (
  list_id INTEGER REFERENCES todo_lists(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permission access_permission NOT NULL,
  PRIMARY KEY (list_id, user_id)
);

CREATE TABLE IF NOT EXISTS todo_list_access_requests (
  list_id INTEGER REFERENCES todo_lists(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  requested_permission access_permission NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status request_status DEFAULT 'PENDING',
  PRIMARY KEY (list_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_lists_owner_id ON todo_lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_todo_list_access_user_id ON todo_list_access(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_list_access_list_id ON todo_list_access(list_id);