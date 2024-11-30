// frontend/app.js

const apiUrl = "https://backend-snowy-snow-5492.fly.dev/";

// Helper function to fetch API with authorization
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    options.headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
    const response = await fetch(`${apiUrl}${endpoint}`, options);
    return response.json();
}

// Handle Registration
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
    });
    alert(response.message || "Registration failed");
});



// Handle Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    if (response.token) {
        localStorage.setItem("token", response.token);
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("task-section").style.display = "block";
        loadTasks();
    } else {
        alert("Login failed");
    }
});

// Handle Logout
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("task-section").style.display = "none";
});

// Load Tasks
async function loadTasks() {
    const tasks = await apiFetch("/tasks", { method: "GET" });
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach((task) => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.innerHTML = `
            <strong>${task.title}</strong>
            <p>${task.description}</p>
            <p>Priority: ${task.priority}</p>
            <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
            <button onclick="deleteTask('${task._id}')">Delete</button>
        `;
        taskList.appendChild(taskItem);
    });
}




// Add Task
document.getElementById("task-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-desc").value;
    const deadline = document.getElementById("task-deadline").value;
    const priority = document.getElementById("task-priority").value;

    await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description, deadline, priority }),
    });
    loadTasks();
});

// Delete Task
async function deleteTask(taskId) {
    await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
    loadTasks();
}

// Check if the user is logged in on page load
if (localStorage.getItem("token")) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("task-section").style.display = "block";
    loadTasks();
}
