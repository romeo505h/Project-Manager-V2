const projects = [];
const tasks = [];
async function loadProjectsFromAPI() {
    const response = await fetch("/projects");

    if (!response.ok) {
        throw new Error("Failed to load projects");
    }

    const data = await response.json();

    data.forEach(function (project) {
        projects.push({
            id: project.project_id,
            name: project.project_name,
            description: project.project_description,
            deadline: project.project_deadline || "No deadline",
            status: "Active",
            progress: 0
        });
    });
}

async function loadTasksFromAPI() {
    for (const project of projects) {
        const response = await fetch(`/projects/${project.id}/tasks`);

        if (!response.ok) {
            throw new Error(`Failed to load task for project ${project.id}`);
        }

        const data = await response.json();

        data.forEach(function (task) {
            tasks.push({
                id: task.task_id,
                projectId: task.project_id,
                name: task.tasks_name,
                completed: task.tasks_completed === 1
            });
        });
    }
}
let editingProjectId = null;
const addProjectButton = document.querySelector("#add-project-btn");
const projectList = document.querySelector(".project-list");
const projectFormTitle = document.querySelector(".project-form-title");
const projectForm = document.querySelector(".project-form");
const projectNameInput = document.querySelector("#project-name");
const projectDescriptionInput = document.querySelector("#project-description");
const projectDeadlineInput = document.querySelector("#project-deadline");
const createProjectButton = document.querySelector("#create-project-btn");
const formError = document.querySelector(".form-error");
const projectCount = document.querySelector("#project-count");
const taskCount = document.querySelector("#task-count");
const completedCount = document.querySelector("#completed-count");
const overdueCount = document.querySelector("#overdue-count");

function updateDashboard() {
    projectCount.textContent = projects.length;
    taskCount.textContent = tasks.length;

    const completedTasks = tasks.filter(function (task) {
        return task.completed;
    });
    completedCount.textContent = completedTasks.length;
    const overdueProjects = projects.filter(function (project) {
        return project.deadline !== "No deadline" && new Date(project.deadline) < new Date() && project.status !== "Completed";
    });
    overdueCount.textContent = overdueProjects.length;
}

function updateProjectProgress(project, projectElement) {
    const projectTasks = tasks.filter(function (task) {
        return task.projectId === project.id;
    });

    if (projectTasks.length === 0) {
        project.progress = 0;
    } else {
        const completedTasks = projectTasks.filter(function (task) {
            return task.completed;
        });
        project.progress = Math.round(
            (completedTasks.length / projectTasks.length) * 100
        );
    }
    const progressFill = projectElement.querySelector(".progress-fill");
    const progressText = projectElement.querySelector(".progress-container span");

    progressFill.style.width = project.progress + "%";
    progressText.textContent = project.progress + "%";
}


function updateProjectStatus(project, projectElement) {
    const projectTasks = tasks.filter(function (task) {
        return task.projectId === project.id;
    });
    const allTasksCompleted =
        projectTasks.length > 0 &&
        projectTasks.every(function (task) {
            return task.completed;
        });

    const statusElement = projectElement.querySelector(".status");

    if (allTasksCompleted) {
        project.status = "Completed";
        statusElement.textContent = "Completed";
        statusElement.classList.add("completed");
    } else {
        project.status = "Active";
        statusElement.textContent = "Active";
        statusElement.classList.remove("completed");
    }
}

function renderEmptyState() {
    if (projects.length === 0) {
        projectList.innerHTML = `
        <div class="empty-state">
            <h3>No projects yet</h3>
            <p>Create your first project to get started.</p>
        </div>
        `;
    }
}

function renderTask(task, taskList, project, projectElement) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");

    taskElement.innerHTML = `
            <span>${task.name}</span>
            <input type="checkbox" class="task-checkbox">
            <div class="task-actions">
                <button class="edit-task-btn">Edit</button>
                <button class="delete-task-btn">x</button>
            </div>
        `;
    taskList.appendChild(taskElement);
    taskElement.dataset.taskId = task.id;

    const checkbox = taskElement.querySelector(".task-checkbox");
    checkbox.checked = task.completed;

    const editTaskButton = taskElement.querySelector(".edit-task-btn");
    const deleteTaskButton = taskElement.querySelector(".delete-task-btn");

    editTaskButton.addEventListener("click", function () {
        const taskNameSpan = taskElement.querySelector("span");
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.name;
        input.classList.add("task-edit-input");

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("save-task-btn");

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("cancel-task-btn");

        taskNameSpan.replaceWith(input);

        const actions = taskElement.querySelector(".task-actions");
        if (actions) {
            actions.appendChild(saveButton);
            actions.appendChild(cancelButton);
        } else {
            taskElement.appendChild(saveButton);
            taskElement.appendChild(cancelButton);
        }
        input.focus();
        input.select();

        checkbox.hidden = true;
        editTaskButton.hidden = true;
        deleteTaskButton.hidden = true;

        async function saveTask() {
            const newTaskName = input.value.trim();

            if (newTaskName === "") {
                input.classList.add("input-error");
                return;
            }

            const response = await fetch(`/tasks/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tasks_name: newTaskName
                })
            });
            if (!response.ok) {
                throw new Error("Failed to update task");
            }
            const data = await response.json();

            task.name = data.tasks_name;

            const newTaskNameSpan = document.createElement("span");
            newTaskNameSpan.textContent = task.name;

            input.replaceWith(newTaskNameSpan);
            saveButton.remove();
            cancelButton.remove();

            checkbox.hidden = false;
            editTaskButton.hidden = false;
            deleteTaskButton.hidden = false;
        }

        function cancelEdit() {
            input.replaceWith(taskNameSpan);
            saveButton.remove();
            cancelButton.remove();

            checkbox.hidden = false;
            editTaskButton.hidden = false;
            deleteTaskButton.hidden = false;
        }
        saveButton.addEventListener("click", saveTask);
        cancelButton.addEventListener("click", cancelEdit);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                saveTask();
            }
            if (event.key === "Escape") {
                cancelEdit();
            }
        });
    });

    toggleTask(task, checkbox, project, projectElement);

    deleteTaskButton.addEventListener("click", function () {
        deleteTask(task, taskElement, project, projectElement);
    });
}

function toggleTask(task, checkbox, project, projectElement) {
    checkbox.addEventListener("change", async function () {
        const response = await fetch(`/tasks/${task.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tasks_completed: checkbox.checked ? 1 : 0
            })
        });
        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        const data = await response.json();

        task.completed = data.tasks_completed === 1;

        updateProjectProgress(project, projectElement);
        updateProjectStatus(project, projectElement);
        updateDashboard();
    });
}

async function createTask(project, taskNameInput, taskList, projectElement, taskForm) {
    if (taskNameInput.value.trim() === "") {
        return;
    }

    const response = await fetch(`/projects/${project.id}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tasks_name: taskNameInput.value.trim()
        })
    });
    if (!response.ok) {
        throw new Error("Failed to create task");
    }
    const data = await response.json();

    const newTask = {
        id: data.task_id,
        projectId: data.project_id,
        name: data.tasks_name,
        completed: data.tasks_completed === 1
    };

    tasks.push(newTask);

    renderTask(newTask, taskList, project, projectElement);
    updateProjectProgress(project, projectElement);
    updateProjectStatus(project, projectElement);
    updateDashboard();
    taskNameInput.value = "";
    taskForm.classList.add("hidden");
}

async function deleteProject(project, projectElement) {
    const confirmed = confirm(`Are you sure you want to delete "${project.name}"? This will also delete all tasks in this project.`);

    if (!confirmed) {
        return;
    }

    const response = await fetch(`/projects/${project.id}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        throw new Error("Failed to delete project");
    }

    const projectId = project.id;

    const remainingTasks = tasks.filter(function (task) {
        return task.projectId !== projectId;
    });

    tasks.length = 0;
    tasks.push(...remainingTasks);

    const remainingProjects = projects.filter(function (project) {
        return project.id !== projectId;
    });

    projects.length = 0;
    projects.push(...remainingProjects);

    updateDashboard();

    projectElement.remove();

    if (projects.length === 0) {
        renderEmptyState();
    }
}

async function deleteTask(task, taskElement, project, projectElement) {
    const confirmed = confirm(`Are you sure you want to delete "${task.name}"?`);
    if (!confirmed) {
        return;
    }

    const response = await fetch(`/tasks/${task.id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete task");
    }

    const remainingTasks = tasks.filter(function (item) {
        return item.id !== task.id;
    });

    tasks.length = 0;
    tasks.push(...remainingTasks);

    taskElement.remove();

    updateProjectProgress(project, projectElement);
    updateProjectStatus(project, projectElement);
    updateDashboard();
}

function renderProject(project) {
    const newProject = document.createElement("div");
    newProject.classList.add("project-card");
    newProject.dataset.projectId = project.id;
    newProject.innerHTML = `
                <div class="project-title">
                    <h3>${project.name}</h3>
                    <span class ="status">${project.status}</span>
                </div>
                <p>${project.description}</p>
                <div class="progress-section">
                    <p>Progress</p>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <span>${project.progress}%</span>
                    </div>
                </div>
                <div class="project-footer">
                    <p>Due: ${project.deadline}</p>
                    <div class="project-actions">
                        <button class="edit-project-btn">Edit Project</button>
                        <button class="delete-project-btn" aria-label="Delete project">x</button>
                    </div>
                </div>
                <button class="add-task-btn">+ Add Task</button>
                <div class="task-form hidden">
                    <input type="text" class="task-name-input" placeholder="Task name">
                    <button type="button" class="create-task-btn">Create Task</button>
                </div>
                <div class="task-list"></div>
            `;
    projectList.appendChild(newProject);
    updateProjectProgress(project, newProject);
    updateProjectStatus(project, newProject);

    const deleteButton = newProject.querySelector(".delete-project-btn");
    deleteButton.addEventListener("click", function () {
        deleteProject(project, newProject);
    });

    const addTaskButton = newProject.querySelector(".add-task-btn");
    const taskList = newProject.querySelector(".task-list");
    const taskForm = newProject.querySelector(".task-form");
    const taskNameInput = newProject.querySelector(".task-name-input");
    const createTaskButton = newProject.querySelector(".create-task-btn");

    createTaskButton.addEventListener("click", function () {
        createTask(project, taskNameInput, taskList, newProject, taskForm);
    });

    const projectTasks = tasks.filter(function (task) {
        return task.projectId === project.id;
    });

    projectTasks.forEach(function (task) {
        renderTask(task, taskList, project, newProject);
    });

    addTaskButton.addEventListener("click", function () {
        taskForm.classList.toggle("hidden");
    });

    taskNameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            createTask(project, taskNameInput, taskList, newProject, taskForm);
        }
    });

    const editProjectButton = newProject.querySelector(".edit-project-btn");
    editProjectButton.addEventListener("click", function () {
        editingProjectId = project.id;

        projectNameInput.value = project.name;
        projectDescriptionInput.value = project.description;
        projectDeadlineInput.value =
            project.deadline === "No deadline" ? "" : project.deadline;

        createProjectButton.textContent = "Save Changes";
        projectFormTitle.textContent = "Edit Project";

        projectForm.classList.remove("hidden");
        projectForm.classList.add("editing");

        projectForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
        projectNameInput.focus();
    });
}
addProjectButton.addEventListener("click", function () {
    editingProjectId = null;

    projectNameInput.value = "";
    projectDescriptionInput.value = "";
    projectDeadlineInput.value = "";

    formError.textContent = "";
    createProjectButton.textContent = "Create Project";
    projectFormTitle.textContent = "Create New Project";

    projectForm.classList.remove("editing");
    projectForm.classList.toggle("hidden");
});

function validateProjectForm() {
    if (projectNameInput.value.trim() === "") {
        projectNameInput.classList.add("input-error");
        formError.textContent = "Please enter a project name.";
        return false;
    }

    projectNameInput.classList.remove("input-error");

    if (projectDescriptionInput.value.trim() === "") {
        projectDescriptionInput.classList.add("input-error");
        formError.textContent = "Please add a description.";
        return false;
    }

    projectDescriptionInput.classList.remove("input-error");
    formError.textContent = "";
    return true;
}
projectForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateProjectForm()) {
        return;
    }

    if (editingProjectId !== null) {
        const response = await fetch(`/projects/${editingProjectId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                project_name: projectNameInput.value.trim(),
                project_description: projectDescriptionInput.value.trim(),
                project_deadline: projectDeadlineInput.value || null
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update project");
        }

        const data = await response.json();

        const project = projects.find(function (project) {
            return project.id === editingProjectId;
        });

        const projectElement = document.querySelector(`[data-project-id="${editingProjectId}"]`);

        project.name = data.project_name;
        project.description = data.project_description;
        project.deadline = data.project_deadline || "No deadline";


        projectElement.querySelector("h3").textContent = project.name;
        projectElement.querySelector(".project-title").nextElementSibling.textContent = project.description;
        projectElement.querySelector(".project-footer p").textContent = "Due: " + project.deadline;

        editingProjectId = null;
        createProjectButton.textContent = "Create Project";
        projectFormTitle.textContent = "Create New Project";
        projectForm.classList.remove("editing");

        updateDashboard();

        projectNameInput.value = "";
        projectDescriptionInput.value = "";
        projectDeadlineInput.value = "";
        projectForm.classList.add("hidden");

    } else {
        const response = await fetch("/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                project_name: projectNameInput.value.trim(),
                project_description: projectDescriptionInput.value.trim(),
                project_deadline: projectDeadlineInput.value || null
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create project");
        }
        const data = await response.json();
        const project = {
            id: data.project_id,
            name: data.project_name,
            description: data.project_description,
            deadline: data.project_deadline || "No deadline",
            status: "Active",
            progress: 0
        };

        projects.push(project);

        const emptyState = projectList.querySelector(".empty-state");
        if (emptyState) {
            emptyState.remove();
        }
        renderProject(project);
        updateDashboard();

        projectNameInput.value = "";
        projectDescriptionInput.value = "";
        projectDeadlineInput.value = "";
        projectForm.classList.add("hidden");
    }
});

projectNameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();

        if (projectNameInput.value.trim() === "") {
            projectNameInput.classList.add("input-error");
            formError.textContent = "Please enter a project name.";
            return;
        }
        projectNameInput.classList.remove("input-error");
        formError.textContent = "";
        projectDescriptionInput.focus();
    }
});

projectDescriptionInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();

        if (projectDescriptionInput.value.trim() === "") {
            projectDescriptionInput.classList.add("input-error");
            formError.textContent = "Please add a description.";
            return;
        }
        projectDescriptionInput.classList.remove("input-error");
        formError.textContent = "";
        projectDeadlineInput.focus();
    }
});

projectDeadlineInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        createProjectButton.focus();
    }
});

projectNameInput.addEventListener("input", function () {
    if (projectNameInput.value.trim() !== "") {
        projectNameInput.classList.remove("input-error");
        formError.textContent = "";
    }
});

projectDescriptionInput.addEventListener("input", function () {
    if (projectDescriptionInput.value.trim() !== "") {
        projectDescriptionInput.classList.remove("input-error");
        formError.textContent = "";
    }
});


async function startApp() {
    try {
        await loadProjectsFromAPI();
        await loadTasksFromAPI();

        updateDashboard();

        if (projects.length === 0) {
            renderEmptyState();
        } else {
            projects.forEach(function (project) {
                renderProject(project);
            });
        }
    } catch (error) {
        console.error(error);
    }
}

startApp();

