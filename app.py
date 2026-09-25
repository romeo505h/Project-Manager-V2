import sqlite3
from flask import Flask, jsonify, request, render_template
app = Flask(__name__)


def init_db():
    connection = get_db_connection()

    with open("database.sql") as file:
        contents = file.read()
        connection.executescript(contents)
    connection.close()


def get_db_connection():
    connection = sqlite3.connect("database.db")
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/projects", methods=["GET", "POST"])
def show_projects():
    if request.method == "POST":
        data = request.get_json()

        if not data or "project_name" not in data:
            return jsonify({"error": "project_name is required"}), 400

        project_name = data["project_name"]
        project_description = data.get("project_description")
        project_deadline = data.get("project_deadline")
        connection = get_db_connection()
        cursor = connection.execute(
            """
            INSERT INTO projects 
            (project_name, project_description, project_deadline) 
            VALUES (?, ?, ?)
            """,
            (project_name, project_description, project_deadline)
        )

        project_id = cursor.lastrowid
        connection.commit()
        connection.close()

        return jsonify({
            "project_id": project_id,
            "project_name": project_name,
            "project_description": project_description,
            "project_deadline": project_deadline
        }), 201

    connection = get_db_connection()
    projects = connection.execute("SELECT * FROM projects").fetchall()
    connection.close()
    return jsonify([dict(project) for project in projects])


@app.route("/projects/<int:project_id>")
def get_project(project_id):
    connection = get_db_connection()

    project = connection.execute(
        "SELECT * FROM projects WHERE project_id = ?",
        (project_id,)
    ).fetchone()

    connection.close()

    if project is None:
        return jsonify({
            "error": "Project not found"
        }), 404

    return jsonify(dict(project))


@app.route("/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    data = request.get_json()

    if not data or "project_name" not in data:
        return jsonify({
            "error": "project_name is required"
        }), 400

    connection = get_db_connection()
    project = connection.execute(
        "SELECT * FROM projects WHERE project_id = ?",
        (project_id,)
    ).fetchone()

    if project is None:
        connection.close()
        return jsonify({
            "error": "Project not found"
        }), 404

    connection.execute(
        """UPDATE projects
        SET project_name = ?, project_description = ?, project_deadline = ?
        WHERE project_id = ?""",
        (
            data["project_name"],
            data.get("project_description"),
            data.get("project_deadline"),
            project_id
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "project_id": project_id,
        "project_name": data["project_name"],
        "project_description": data.get("project_description"),
        "project_deadline": data.get("project_deadline")
    }), 200


@app.route("/projects/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    connection = get_db_connection()

    project = connection.execute(
        "SELECT * FROM projects WHERE project_id = ?",
        (project_id,)
    ).fetchone()

    if project is None:
        connection.close()
        return jsonify({
            "error": "Project not found"
        }), 404

    connection.execute(
        "DELETE FROM projects WHERE project_id = ?",
        (project_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Project deleted successfully"
    }), 200


@app.route("/projects/<int:project_id>/tasks", methods=["POST"])
def create_task(project_id):
    data = request.get_json()

    if not data or "tasks_name" not in data:
        return jsonify({
            "error": "tasks_name is required"
        }), 400

    connection = get_db_connection()

    project = connection.execute(
        "SELECT * FROM projects WHERE project_id = ?",
        (project_id,)
    ).fetchone()

    if project is None:
        connection.close()
        return jsonify({
            "error": "Project not found"
        }), 404
    cursor = connection.execute(
        "INSERT INTO tasks (project_id, tasks_name) VALUES (?, ?)",
        (project_id, data["tasks_name"])
    )

    task_id = cursor.lastrowid
    connection.commit()
    connection.close()

    return jsonify({
        "task_id": task_id,
        "project_id": project_id,
        "tasks_name": data["tasks_name"],
        "tasks_completed": 0
    }), 201


@app.route("/projects/<int:project_id>/tasks")
def get_tasks(project_id):
    connection = get_db_connection()
    project = connection.execute(
        "SELECT * FROM projects WHERE project_id = ?",
        (project_id,)
    ).fetchone()

    if project is None:
        connection.close()
        return jsonify({
            "error": "Project not found"
        }), 404

    tasks = connection.execute(
        "SELECT * FROM tasks WHERE project_id = ?",
        (project_id,)
    ).fetchall()

    connection.close()
    return jsonify([dict(task) for task in tasks])


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()

    if not data or ("tasks_completed" not in data and "tasks_name" not in data):
        return jsonify({
            "error": "tasks_completed or tasks_name is required"
        }), 400

    connection = get_db_connection()

    task = connection.execute(
        "SELECT * FROM tasks WHERE task_id = ?",
        (task_id,)
    ).fetchone()

    if task is None:
        connection.close()
        return jsonify({
            "error": "Task not found"
        }), 404

    new_name = data.get("tasks_name", task["tasks_name"])
    new_completed = data.get("tasks_completed", task["tasks_completed"])
    connection.execute(
        """
        UPDATE tasks
        SET tasks_name = ?, tasks_completed = ?
        WHERE task_id = ?
        """,
        (new_name, new_completed, task_id)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "task_id": task_id,
        "project_id": task["project_id"],
        "tasks_name": new_name,
        "tasks_completed": new_completed
    }), 200


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    connection = get_db_connection()

    task = connection.execute(
        "SELECT * FROM tasks WHERE task_id = ?",
        (task_id,)
    ).fetchone()

    if task is None:
        connection.close()
        return jsonify({
            "error": "Task not found"
        }), 404

    connection.execute(
        "DELETE FROM tasks WHERE task_id = ?",
        (task_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Task deleted successfully"
    }), 200


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
