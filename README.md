# Project Manager V2

A full-stack project management web application built with **Python, Flask, SQLite, HTML, CSS, and JavaScript**.

This is my first full-stack project and the second version of my Project Manager application. The main goal of V2 was to move beyond frontend-only functionality and build a proper application with a backend, API, and database.
This version is intentionally kept as a focused MVP. The main goal was to understand the core full-stack architecture and how the frontend, backend, API, and database work together.
The application allows users to create projects, manage tasks, track progress, and keep their data stored in a SQLite database.

## Screenshots

### Dashboard

<img width="1884" height="893" alt="dashboard" src="https://github.com/user-attachments/assets/3a8903ec-1c6f-4b01-8be6-8dbd8d29d46b" />


### Projects and Tasks

<img width="1663" height="1079" alt="progress-bar" src="https://github.com/user-attachments/assets/cd343f3e-3f9f-4b02-a2ff-c6d053758bd8" />


### Create / Edit Project

<img width="1504" height="568" alt="edit-project" src="https://github.com/user-attachments/assets/011390e0-817e-480a-bbd6-c2b9eae8b793" />


### Create / Edit Task

 <img width="1483" height="691" alt="editing-task-name" src="https://github.com/user-attachments/assets/11690199-81b0-4076-9ce7-fbf43c651db1" />


## Features

### Projects

* Create, edit, and delete projects
* Add descriptions and deadlines
* Automatically track project status
* Detect overdue projects

### Tasks

* Create tasks inside projects
* Edit and delete tasks
* Mark tasks as completed
* Automatically calculate project progress
* Automatically update project status

### Dashboard

* Total projects
* Total tasks
* Completed tasks
* Overdue projects
* Project progress

### Data Persistence

Projects and tasks are stored in a SQLite database, so data remains available after refreshing the page.

The application uses a foreign-key relationship between projects and tasks. `ON DELETE CASCADE` is used so that when a project is deleted, its related tasks are deleted as well.

## How It Works

The application is split into three main parts:

```text
Frontend
HTML / CSS / JavaScript
        ↓
     Fetch API
        ↓
Flask Backend / API
        ↓
      SQL
        ↓
SQLite Database
```

The frontend sends requests to the Flask API. Flask handles the request, communicates with the SQLite database, and returns the result as JSON. JavaScript then uses that response to update the interface.

## Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript
* Fetch API

**Backend**

* Python
* Flask
* REST-style API endpoints

**Database**

* SQLite
* SQL
* Foreign keys

**Tools**

* Git
* GitHub
* Python virtual environment

## Project Structure

```text
Project-Manager-V2/
│
├── app.py
├── database.sql
├── database.db
├── .gitignore
├── README.md
│
├── templates/
│   └── index.html
│
└── static/
    ├── style.css
    └── script.js
```

`database.sql` contains the database schema used to create the `projects` and `tasks` tables.

## API

The frontend communicates with Flask through HTTP requests.

### Projects

| Method | Endpoint         | Purpose          |
| ------ | ---------------- | ---------------- |
| GET    | `/projects`      | Get all projects |
| POST   | `/projects`      | Create a project |
| GET    | `/projects/<id>` | Get a project    |
| PUT    | `/projects/<id>` | Update a project |
| DELETE | `/projects/<id>` | Delete a project |

### Tasks

| Method | Endpoint               | Purpose           |
| ------ | ---------------------- | ----------------- |
| GET    | `/projects/<id>/tasks` | Get project tasks |
| POST   | `/projects/<id>/tasks` | Create a task     |
| PUT    | `/tasks/<id>`          | Update a task     |
| DELETE | `/tasks/<id>`          | Delete a task     |

## Database

The application uses two tables.

### Projects

```text
projects
├── project_id
├── project_name
├── project_description
└── project_deadline
```

### Tasks

```text
tasks
├── task_id
├── project_id
├── tasks_completed
└── tasks_name
```

Each task belongs to a project through `project_id`.

```text
Project
 ├── Task
 ├── Task
 └── Task
```

The relationship is enforced using a foreign key:

```sql
FOREIGN KEY (project_id)
REFERENCES projects(project_id)
ON DELETE CASCADE
```

## Key Concepts Practiced

- REST-style API design
- CRUD operations
- HTTP methods and status codes
- SQL queries
- Relational database design
- Foreign keys and cascading deletes
- Frontend/backend communication
- JSON request and response handling
- Client-side and server-side validation
- Persistent application state

## What I Learned

V1 was mainly focused on building the frontend and getting the application logic working.

With V2, I wanted to understand what happens behind the interface.

I learned how to connect a JavaScript frontend to a Flask backend using API requests, how to work with SQLite and SQL, how to create relationships between tables, and how to make application data persistent.

One of the biggest things I learned was how the different parts of a full-stack application communicate:

```text
User
 ↓
Frontend
 ↓
JavaScript / Fetch
 ↓
Flask API
 ↓
SQL
 ↓
SQLite Database
 ↓
Flask Response
 ↓
Frontend
```

I also became much more comfortable with CRUD operations, HTTP status codes, backend validation, foreign keys, debugging, and testing an application as a complete system.

## V1 → V2

The biggest change between the two versions was the architecture.

**V1**

Frontend-focused application with client-side state.

**V2**

Frontend + Flask backend + API + SQLite database.

Instead of only managing data in the browser, V2 stores the actual project and task data in a database and retrieves it through the backend.

That was the main step I wanted to achieve with this version.

## Testing

I tested the main application flows, including:

* Creating, editing, and deleting projects
* Creating, editing, completing, and deleting tasks
* Data persistence after refreshing
* Project progress calculations
* Project status changes
* Overdue projects
* Deleting a project and its related tasks

I also tested the API responses and error cases, including missing data and requests for projects or tasks that do not exist.

## Running Locally

Clone the repository:

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd Project-Manager-V2
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\Activate.ps1
```

Install Flask:

```bash
pip install flask
```

Run the application:

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

The Flask application runs the SQL schema from `database.sql` on startup, creating the required tables if they do not already exist.

## Future Improvements

This version is intentionally kept as an MVP.

If I continue working on it, some things I could explore are:

* User authentication
* Multiple users
* More advanced filtering and sorting
* Automated tests
* Better error handling in the UI
* Production deployment
* PostgreSQL instead of SQLite

## About

Project Manager V2 is part of my progression from learning frontend development to building full-stack applications.

The main thing I wanted to get out of this project was not just another working application, but a better understanding of how the frontend, backend, API, and database work together.

V1 helped me understand how to build the interface.

V2 helped me understand what happens behind it.
