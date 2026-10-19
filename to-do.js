const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyMessage = document.getElementById("empty-message");
const count = document.getElementById("todo-count");
const stats = document.getElementById("todo-stats");
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
    li.className = "task-row d-flex align-items-center gap-2" + (todo.done ? " done" : "");

    const info = document.createElement("div");
    info.className = "flex-grow-1";

    const text = document.createElement("span");
    text.className = "task-text d-block";
    text.textContent = todo.text;
    info.appendChild(text);

    if (todo.added) {
      const time = document.createElement("small");
      time.className = "task-time d-block";
      time.textContent = "Added: " + new Date(todo.added).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
      info.appendChild(time);
    }

    // x = delete
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn";
    deleteBtn.textContent = "x";
    deleteBtn.title = "Delete task";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.addEventListener("click", () => deleteTodo(index));

    // ✓ = done / undo
    const doneBtn = document.createElement("button");
    doneBtn.className = "icon-btn" + (todo.done ? " active" : "");
    doneBtn.textContent = "\u2713";
    doneBtn.title = todo.done ? "Mark as not done" : "Mark as done";
    doneBtn.setAttribute("aria-label", doneBtn.title);
    doneBtn.addEventListener("click", () => toggleTodo(index));

    li.append(info, deleteBtn, doneBtn);
    list.appendChild(li);
  });

  const total = todos.length;
  const done = todos.filter(t => t.done).length;
  const remaining = total - done;

  stats.textContent = "Total: " + total + " | Done: " + done + " | Left: " + remaining;
  count.textContent = remaining + (remaining === 1 ? " task left" : " tasks left");

  emptyMessage.classList.toggle("d-none", total > 0);
  clearBtn.disabled = done === 0;
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

// ===== Sparkles + meteors background =====
(function () {
  const canvas = document.getElementById("sparkles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Sparkle settings
  const PARTICLE_DENSITY = 0.00022; // more = more sparkles
  const MIN_SIZE = 0.8;
  const MAX_SIZE = 2.4;
  const SPEED = 0.18;

  // Meteor settings
  const METEOR_COUNT = 20;          // same as <Meteors number={20} />
  const METEOR_MIN_SPEED = 350;     // pixels per second
  const METEOR_MAX_SPEED = 750;
  const METEOR_MIN_LENGTH = 90;
  const METEOR_MAX_LENGTH = 200;
  const METEOR_MAX_DELAY = 6;       // seconds a meteor waits before falling
  // Direction: top-right -> bottom-left (45 degrees)
  const DIR_X = -Math.SQRT1_2;
  const DIR_Y = Math.SQRT1_2;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let particles = [];
  let meteors = [];
  let w = 0, h = 0;
  let lastTime = 0;

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.5 + Math.random() * 1.5
    };
  }

  function resetMeteor(m) {
    m.length = METEOR_MIN_LENGTH + Math.random() * (METEOR_MAX_LENGTH - METEOR_MIN_LENGTH);
    m.speed = METEOR_MIN_SPEED + Math.random() * (METEOR_MAX_SPEED - METEOR_MIN_SPEED);
    m.x = Math.random() * (w + h);  // start along the top/right so it crosses the screen
    m.y = -m.length;
    m.wait = Math.random() * METEOR_MAX_DELAY;
    return m;
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const total = Math.floor(w * h * PARTICLE_DENSITY);
    particles = Array.from({ length: total }, makeParticle);

    meteors = reduceMotion ? [] : Array.from({ length: METEOR_COUNT }, () => resetMeteor({}));
  }

  function drawMeteor(m) {
    const tailX = m.x - DIR_X * m.length;
    const tailY = m.y - DIR_Y * m.length;

    // Tail: bright at the head, fading to nothing
    const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.3, "rgba(160, 195, 255, 0.45)");
    grad.addColorStop(1, "rgba(160, 195, 255, 0)");

    ctx.shadowBlur = 0;
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    // Glowing head
    ctx.beginPath();
    ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.shadowColor = "rgba(190, 215, 255, 1)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function draw(time) {
    const dt = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;
    const t = time / 1000;

    ctx.clearRect(0, 0, w, h);

    // Sparkles
    for (const p of particles) {
      if (!reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }
      const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * p.twinkle * 2 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, " + alpha.toFixed(3) + ")";
      ctx.shadowColor = "rgba(190, 215, 255, " + alpha.toFixed(3) + ")";
      ctx.shadowBlur = 8;
      ctx.fill();
    }

    // Meteors
    for (const m of meteors) {
      if (m.wait > 0) {
        m.wait -= dt;
        continue;
      }
      m.x += DIR_X * m.speed * dt;
      m.y += DIR_Y * m.speed * dt;

      if (m.y - m.length > h || m.x + m.length < 0) {
        resetMeteor(m);
        continue;
      }
      drawMeteor(m);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();