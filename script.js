/* =============================================
   ASU.TECH — script.js
   ============================================= */

/* ── 1. Mobile nav toggle ── */
const navToggle = document.getElementById('navToggle');
const navMenu   = document.querySelector('header nav');

navToggle.addEventListener('click', function(e) {
  e.stopPropagation();
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  navToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
});

// Close nav when a link is clicked
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.innerHTML = '&#9776;';
    navToggle.setAttribute('aria-expanded', false);
  });
});

// Close nav when clicking outside
document.addEventListener('click', function(e) {
  if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
    navMenu.classList.remove('open');
    navToggle.innerHTML = '&#9776;';
    navToggle.setAttribute('aria-expanded', false);
  }
});

/* ── 2. Active nav highlight on scroll ── */
const sections = document.querySelectorAll('main section[id]');
const navLinks  = document.querySelectorAll('nav a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

/* ── 3. Typewriter terminal in hero ── */
const terminalBody = document.getElementById('terminalBody');

const lines = [
  { type: 'prompt', text: '~/asu.tech' },
  { type: 'cmd',   text: ' whoami' },
  { type: 'out',   text: 'alexander_solomon_ushahemba' },
  { type: 'prompt', text: '~/asu.tech' },
  { type: 'cmd',   text: ' skills --list' },
  { type: 'out',   text: '→ software_engineering' },
  { type: 'out',   text: '→ networking' },
  { type: 'out',   text: '→ cybersecurity' },
  { type: 'prompt', text: '~/asu.tech' },
  { type: 'cmd',   text: ' status' },
  { type: 'out',   text: 'Building secure systems...' },
];

let lineIndex = 0;
let charIndex = 0;
let currentEl = null;

function createLineEl(type) {
  const el = document.createElement('div');
  el.style.minHeight = '1.5em';
  if (type === 'prompt') {
    el.innerHTML = '<span class="prompt">$ </span>';
  } else {
    el.className = type;
  }
  return el;
}

function typeNext() {
  if (lineIndex >= lines.length) {
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    terminalBody.appendChild(cursor);
    return;
  }

  const line = lines[lineIndex];

  if (charIndex === 0) {
    currentEl = createLineEl(line.type);
    terminalBody.appendChild(currentEl);
  }

  if (charIndex < line.text.length) {
    if (line.type === 'prompt') {
      // append to a text node after the $ span
      let textNode = currentEl.lastChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        textNode = document.createTextNode('');
        currentEl.appendChild(textNode);
      }
      textNode.textContent += line.text[charIndex];
    } else {
      currentEl.textContent += line.text[charIndex];
    }
    charIndex++;
    setTimeout(typeNext, line.type === 'out' ? 28 : 50);
  } else {
    lineIndex++;
    charIndex = 0;
    const pause = line.type === 'cmd' ? 380 : 100;
    setTimeout(typeNext, pause);
  }
}

// Start typing after a short delay
setTimeout(typeNext, 600);

/* ── 4. Academic Planner ── */
const taskInput  = document.getElementById('taskInput');
const taskDate   = document.getElementById('taskDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList   = document.getElementById('taskList');

// Load from localStorage
let tasks = JSON.parse(localStorage.getItem('asu_tasks') || '[]');
renderAllTasks();

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

function addTask() {
  const label = taskInput.value.trim();
  if (!label) { taskInput.focus(); return; }
  const task = { id: Date.now(), label, date: taskDate.value, done: false };
  tasks.push(task);
  saveTasks();
  renderTask(task);
  taskInput.value = '';
  taskDate.value  = '';
  taskInput.focus();
}

function renderTask(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.done ? ' done' : '');
  li.dataset.id = task.id;

  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.className = 'task-check';
  chk.checked = task.done;
  chk.addEventListener('change', () => toggleTask(task.id, li));

  const lbl = document.createElement('span');
  lbl.className = 'task-label';
  lbl.textContent = task.label;

  const del = document.createElement('button');
  del.className = 'task-del';
  del.textContent = '×';
  del.title = 'Delete task';
  del.addEventListener('click', () => deleteTask(task.id, li));

  li.appendChild(chk);
  li.appendChild(lbl);

  if (task.date) {
    const dt = document.createElement('span');
    dt.className = 'task-date';
    dt.textContent = formatDate(task.date);
    li.appendChild(dt);
  }

  li.appendChild(del);
  taskList.appendChild(li);
}

function renderAllTasks() {
  taskList.innerHTML = '';
  tasks.forEach(renderTask);
}

function toggleTask(id, li) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  li.classList.toggle('done');
  li.querySelector('.task-check').checked = tasks.find(t => t.id === id).done;
}

function deleteTask(id, li) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  li.style.opacity = '0';
  li.style.transition = 'opacity 0.2s ease';
  setTimeout(() => li.remove(), 200);
}

function saveTasks() { localStorage.setItem('asu_tasks', JSON.stringify(tasks)); }

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

/* ── 5. Contact form ── */
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');

contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const name  = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const msg   = contactForm.message.value.trim();

  if (!name || !email || !msg) {
    showStatus('Please fill in all fields.', '#ff5f57');
    return;
  }
  if (!isValidEmail(email)) {
    showStatus('Please enter a valid email address.', '#ff5f57');
    return;
  }

  // Simulate sending
  const btn = contactForm.querySelector('.btn-primary');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    showStatus(`Thanks, ${name}! I'll be in touch soon.`, 'var(--cyan)');
    contactForm.reset();
    btn.textContent = 'Send Message';
    btn.disabled = false;
  }, 1200);
});

function showStatus(msg, color) {
  formStatus.textContent = msg;
  formStatus.style.color = color;
  setTimeout(() => { formStatus.textContent = ''; }, 5000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── 6. Scroll-reveal for cards ── */
const revealEls = document.querySelectorAll(
  '.service-card, .project-card, .about-grid, .contact-grid'
);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});
