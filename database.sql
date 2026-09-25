CREATE TABLE IF NOT EXISTS projects (
    project_id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    project_description TEXT,
    project_deadline TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
    task_id INTEGER PRIMARY KEY,
    project_id INTEGER NOT NULL,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_name TEXT NOT NULL,

    FOREIGN KEY (project_id)
        REFERENCES projects(project_id) 
        ON DELETE CASCADE 
);