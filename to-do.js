const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyMessage = document.getElementById("empty-message");
const count = document.getElementById("todo-count");
const clearBtn = document.getElementById("clear-completed");

// Load saved tasks, or start with an empty list
let todos = JSON.parse(localStorage.getItem("todos")) || [];

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function render() {
  list.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-center";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input me-3 mt-0";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleTodo(index));

    const info = document.createElement("div");
    info.className = "flex-grow-1";

    const text = document.createElement("span");
    text.className = "d-block" + (todo.done ? " text-decoration-line-through text-body-secondary" : "");
    text.textContent = todo.text;
    info.appendChild(text);

    if (todo.added) {
      const time = document.createElement("small");
      time.className = "d-block text-body-secondary";
      time.textContent = "Added: " + new Date(todo.added).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
      info.appendChild(time);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-outline-danger btn-sm";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTodo(index));

    li.append(checkbox, info, deleteBtn);
    list.appendChild(li);
  });

  const remaining = todos.filter(t => !t.done).length;
  count.textContent = remaining + (remaining === 1 ? " task left" : " tasks left");

  emptyMessage.classList.toggle("d-none", todos.length > 0);
  clearBtn.disabled = !todos.some(t => t.done);
}

function addTodo(text) {
  todos.push({ text: text, done: false, added: new Date().toISOString() });
  save();
  render();
}

function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  save();
  render();
}

function deleteTodo(index) {
  todos.splice(index, 1);
  save();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") return;
  addTodo(text);
  input.value = "";
  input.focus();
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.done);
  save();
  render();
});

render();