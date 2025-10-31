// ...existing code...
const STORAGE_KEY = "todo.tasks.v1";

const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTaskNode(task) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;

    const left = document.createElement("div");
    left.className = "task-left";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!task.completed;
    cb.className = "task-checkbox";
    cb.dataset.action = "toggle";

    const text = document.createElement("span");
    text.className = "task-text";
    if (task.completed) text.classList.add("done");
    text.textContent = task.text;
    text.tabIndex = 0;
    text.title = "Double-click to edit";

    left.appendChild(cb);
    left.appendChild(text);

    const controls = document.createElement("div");
    controls.className = "task-controls";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit";
    editBtn.textContent = "Edit";
    editBtn.dataset.action = "edit";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "delete";
    delBtn.textContent = "Delete";
    delBtn.dataset.action = "delete";

    controls.appendChild(editBtn);
    controls.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(controls);

    return li;
}

function render() {
    const tasks = getTasks();
    taskList.innerHTML = "";
    if (tasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "No tasks — add one!";
        taskList.appendChild(empty);
        return;
    }
    const fragment = document.createDocumentFragment();
    tasks.forEach(t => fragment.appendChild(createTaskNode(t)));
    taskList.appendChild(fragment);
}

function addTask(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    const tasks = getTasks();
    tasks.push({ id: uid(), text: trimmed, completed: false, createdAt: Date.now() });
    saveTasks(tasks);
    render();
    input.focus();
    input.value = "";
}

function findIndexById(id) {
    return getTasks().findIndex(t => t.id === id);
}

taskList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    const id = e.target.closest("li")?.dataset.id;
    if (btn && id) {
        const action = btn.dataset.action;
        const tasks = getTasks();
        const idx = tasks.findIndex(t => t.id === id);
        if (idx === -1) return;
        if (action === "delete") {
            tasks.splice(idx, 1);
            saveTasks(tasks);
            render();
        } else if (action === "edit") {
            startEdit(id);
        }
        return;
    }

    // checkbox clicks (delegated)
    if (e.target.matches("input.task-checkbox")) {
        const id = e.target.closest("li")?.dataset.id;
        const tasks = getTasks();
        const idx = tasks.findIndex(t => t.id === id);
        if (idx === -1) return;
        tasks[idx].completed = e.target.checked;
        saveTasks(tasks);
        render();
    }
});

taskList.addEventListener("dblclick", (e) => {
    const span = e.target.closest("span.task-text");
    if (span) {
        const id = span.closest("li")?.dataset.id;
        if (id) startEdit(id);
    }
});

function startEdit(id) {
    const li = taskList.querySelector(`li[data-id="${id}"]`);
    if (!li) return;
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;

    const span = li.querySelector("span.task-text");
    const original = tasks[idx].text;

    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.className = "task-edit";
    inputEl.value = original;
    inputEl.setAttribute("aria-label", "Edit task");
    span.replaceWith(inputEl);
    inputEl.focus();
    inputEl.select();

    function finish(save) {
        if (save) {
            const v = inputEl.value.trim();
            if (v) {
                tasks[idx].text = v;
                saveTasks(tasks);
            }
        }
        render();
    }

    inputEl.addEventListener("blur", () => finish(true));
    inputEl.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") finish(true);
        if (ev.key === "Escape") finish(false);
    });
}

addBtn.addEventListener("click", () => addTask(input.value));
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask(input.value);
});

render();
// ...existing code...