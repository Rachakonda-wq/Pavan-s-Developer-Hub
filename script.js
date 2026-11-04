"use strict";


/* =====================================
   HELPER FUNCTIONS
===================================== */

// Select one HTML element.
const $ = (selector) => document.querySelector(selector);

// Select multiple HTML elements.
const $$ = (selector) => [...document.querySelectorAll(selector)];


// Read information from localStorage.
function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}


// Save information in localStorage.
function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}


// Display a small notification.
function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}


/* =====================================
   PAGE NAVIGATION
===================================== */

function showPage(pageId) {

  const page = document.getElementById(pageId);

  if (!page) return;

  $$(".page-section").forEach(section => {

    section.classList.toggle(
      "active",
      section.id === pageId
    );

  });

  $$(".nav-link").forEach(link => {

    link.classList.toggle(
      "active",
      link.dataset.page === pageId
    );

  });

  $("#mainNav").classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// Navigation links.
$$("[data-page]").forEach(link => {

  link.addEventListener("click", event => {

    event.preventDefault();

    const pageId = link.dataset.page;

    showPage(pageId);

    history.pushState(
      { page: pageId },
      "",
      `#${pageId}`
    );

  });

});


// Buttons that open another page.
$$("[data-go]").forEach(button => {

  button.addEventListener("click", () => {

    const pageId = button.dataset.go;

    showPage(pageId);

    history.pushState(
      { page: pageId },
      "",
      `#${pageId}`
    );

  });

});


// Browser back and forward buttons.
window.addEventListener("popstate", () => {

  const pageId = location.hash.replace("#", "") || "home";

  showPage(pageId);

});


// Open the correct page when the website loads.
const initialPage = location.hash.replace("#", "") || "home";

showPage(
  document.getElementById(initialPage)
    ? initialPage
    : "home"
);


/* =====================================
   MOBILE NAVIGATION
===================================== */

$("#menuToggle").addEventListener("click", () => {

  $("#mainNav").classList.toggle("open");

});


/* =====================================
   LIGHT AND DARK THEME
===================================== */

const savedTheme = localStorage.getItem("pavanTheme");

if (savedTheme === "light") {
  document.body.classList.add("light-theme");
}


$("#themeToggle").addEventListener("click", () => {

  document.body.classList.toggle("light-theme");

  const theme = document.body.classList.contains("light-theme")
    ? "light"
    : "dark";

  localStorage.setItem("pavanTheme", theme);

});


/* =====================================
   PROFILE INFORMATION
===================================== */

const defaultProfile = {

  name: "Rachakonda Pavan Kumar",

  role: "Computer Science Graduate",

  bio: "I am a Computer Science graduate from Scient Institute of Technology. I enjoy learning web technologies and building practical projects that solve everyday problems."

};


let profile = readStorage(
  "pavanPortfolioProfile",
  defaultProfile
);


// Display saved profile information.
function renderProfile() {

  $("#displayName").textContent = profile.name;

  $("#displayRole").textContent = profile.role;

  $("#displayBio").textContent = profile.bio;

  $("#editName").value = profile.name;

  $("#editRole").value = profile.role;

  $("#editBio").value = profile.bio;

}


renderProfile();


// Open and close portfolio editor.
$("#toggleEditor").addEventListener("click", () => {

  const editor = $("#profileEditor");

  editor.classList.toggle("hidden");

  $("#toggleEditor").textContent =
    editor.classList.contains("hidden")
      ? "Update My Portfolio"
      : "Close Portfolio Editor";

  if (!editor.classList.contains("hidden")) {
    renderProfile();
  }

});


// Save profile information.
$("#profileForm").addEventListener("submit", event => {

  event.preventDefault();

  profile = {

    name: $("#editName").value.trim(),

    role: $("#editRole").value.trim(),

    bio: $("#editBio").value.trim()

  };

  writeStorage("pavanPortfolioProfile", profile);

  renderProfile();

  showToast("Profile updated successfully!");

});


/* =====================================
   SKILLS: ADD, EDIT AND DELETE
===================================== */

const defaultSkills = [
  "HTML",
  "CSS",
  "JavaScript",
  "Java",
  "Python",
  "MySQL"
];


let skills = readStorage(
  "pavanPortfolioSkills",
  defaultSkills
);


// Display skills on the portfolio and inside the editor.
function renderSkills() {

  const publicContainer = $("#publicSkills");

  const manageContainer = $("#manageSkills");

  publicContainer.innerHTML = "";

  manageContainer.innerHTML = "";

  if (skills.length === 0) {

    publicContainer.innerHTML =
      '<p class="muted">No skills added yet.</p>';

    manageContainer.innerHTML =
      '<p class="empty-state">Add your first skill above.</p>';

    return;

  }


  skills.forEach((skill, index) => {

    // Public skill card.
    const chip = document.createElement("span");

    chip.className = "skill-chip";

    chip.textContent = skill;

    publicContainer.appendChild(chip);


    // Editor skill item.
    const item = document.createElement("div");

    item.className = "manage-item";

    const info = document.createElement("div");

    info.className = "manage-item-info";

    const name = document.createElement("strong");

    name.textContent = skill;

    info.appendChild(name);


    const actions = document.createElement("div");

    actions.className = "manage-actions";


    // Edit button.
    const editButton = document.createElement("button");

    editButton.className = "mini-btn";

    editButton.type = "button";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      editSkill(index);
    });


    // Delete button.
    const deleteButton = document.createElement("button");

    deleteButton.className = "mini-btn delete";

    deleteButton.type = "button";

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteSkill(index);
    });


    actions.append(editButton, deleteButton);

    item.append(info, actions);

    manageContainer.appendChild(item);

  });

}


// Save skills.
function saveSkills() {

  writeStorage("pavanPortfolioSkills", skills);

  renderSkills();

}


// Add a new skill.
$("#skillForm").addEventListener("submit", event => {

  event.preventDefault();

  const input = $("#skillInput");

  const newSkill = input.value.trim();

  if (!newSkill) return;


  const duplicate = skills.some(
    skill => skill.toLowerCase() === newSkill.toLowerCase()
  );


  if (duplicate) {

    showToast("This skill is already added.");

    return;

  }


  skills.push(newSkill);

  saveSkills();

  input.value = "";

  showToast("Skill added successfully!");

});


// Edit an existing skill.
function editSkill(index) {

  const updated = prompt(
    "Edit skill name:",
    skills[index]
  );

  if (updated === null) return;

  const newName = updated.trim();

  if (!newName) {

    showToast("Skill name cannot be empty.");

    return;

  }


  const duplicate = skills.some(
    (skill, i) =>
      i !== index &&
      skill.toLowerCase() === newName.toLowerCase()
  );


  if (duplicate) {

    showToast("This skill already exists.");

    return;

  }


  skills[index] = newName;

  saveSkills();

  showToast("Skill updated successfully!");

}


// Delete a skill.
function deleteSkill(index) {

  if (!confirm(`Delete "${skills[index]}" from your skills?`)) {
    return;
  }

  skills.splice(index, 1);

  saveSkills();

  showToast("Skill deleted.");

}


renderSkills();


/* =====================================
   PROJECTS: ADD, EDIT AND DELETE
===================================== */

const defaultProjects = [

  {
    name: "RecipeRadar",

    description: "A recipe finder featuring famous Hyderabad dishes, recipe details, search and favourites.",

    link: "https://rachakonda-wq.github.io/RecipeRadar/"
  },

  {
    name: "Yātrā – Discover India",

    description: "A responsive travel website showcasing destinations, galleries and travel information across India.",

    link: "#"
  },

  {
    name: "Pavan's Developer Hub",

    description: "A personal portfolio with a task manager and a product listing page.",

    link: "#"
  }

];


let projects = readStorage(
  "pavanPortfolioProjects",
  defaultProjects
);


// Display projects.
function renderProjects() {

  const publicContainer = $("#publicProjects");

  const manageContainer = $("#manageProjects");

  publicContainer.innerHTML = "";

  manageContainer.innerHTML = "";


  if (projects.length === 0) {

    publicContainer.innerHTML =
      '<p class="muted">No projects added yet.</p>';

    manageContainer.innerHTML =
      '<p class="empty-state">Add your first project above.</p>';

    return;

  }


  projects.forEach((project, index) => {

    // Public project card.
    const card = document.createElement("article");

    card.className = "panel project-card";


    const number = document.createElement("span");

    number.className = "project-number";

    number.textContent =
      `PROJECT ${String(index + 1).padStart(2, "0")}`;


    const title = document.createElement("h3");

    title.textContent = project.name;


    const description = document.createElement("p");

    description.textContent = project.description;


    card.append(number, title, description);


    if (project.link && project.link !== "#") {

      const link = document.createElement("a");

      link.href = project.link;

      link.textContent = "View Project ↗";

      link.target = "_blank";

      link.rel = "noopener noreferrer";

      card.appendChild(link);

    }


    publicContainer.appendChild(card);


    // Project management item.
    const manageItem = document.createElement("div");

    manageItem.className = "manage-item";


    const info = document.createElement("div");

    info.className = "manage-item-info";


    const projectName = document.createElement("strong");

    projectName.textContent = project.name;


    const projectDescription = document.createElement("small");

    projectDescription.textContent = project.description;


    info.append(projectName, projectDescription);


    const actions = document.createElement("div");

    actions.className = "manage-actions";


    const editButton = document.createElement("button");

    editButton.className = "mini-btn";

    editButton.type = "button";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      editProject(index);
    });


    const deleteButton = document.createElement("button");

    deleteButton.className = "mini-btn delete";

    deleteButton.type = "button";

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteProject(index);
    });


    actions.append(editButton, deleteButton);

    manageItem.append(info, actions);

    manageContainer.appendChild(manageItem);

  });

}


// Save projects.
function saveProjects() {

  writeStorage("pavanPortfolioProjects", projects);

  renderProjects();

}


// Add a project.
$("#projectForm").addEventListener("submit", event => {

  event.preventDefault();

  const name = $("#projectName").value.trim();

  const description = $("#projectDescription").value.trim();

  const link = $("#projectLink").value.trim();


  if (!name || !description) return;


  projects.push({
    name,
    description,
    link
  });


  saveProjects();

  $("#projectForm").reset();

  showToast("Project added successfully!");

});


// Edit a project.
function editProject(index) {

  const current = projects[index];

  const name = prompt(
    "Edit project name:",
    current.name
  );

  if (name === null) return;


  const description = prompt(
    "Edit project description:",
    current.description
  );

  if (description === null) return;


  const link = prompt(
    "Edit project URL (leave blank if none):",
    current.link || ""
  );

  if (link === null) return;


  if (!name.trim() || !description.trim()) {

    showToast("Project name and description are required.");

    return;

  }


  if (link.trim()) {

    try {

      const parsed = new URL(link.trim());

      if (!["http:", "https:"].includes(parsed.protocol)) {

        showToast("Please enter a valid HTTP or HTTPS project URL.");

        return;

      }

    } catch {

      showToast("Please enter a valid project URL.");

      return;

    }

  }


  projects[index] = {

    name: name.trim(),

    description: description.trim(),

    link: link.trim()

  };


  saveProjects();

  showToast("Project updated successfully!");

}


// Delete a project.
function deleteProject(index) {

  if (!confirm(`Delete "${projects[index].name}" from your projects?`)) {
    return;
  }

  projects.splice(index, 1);

  saveProjects();

  showToast("Project deleted.");

}


renderProjects();


/* =====================================
   CUSTOM PORTFOLIO SECTIONS
===================================== */

// These are the sections created by the user.
let customSections = readStorage(
  "pavanCustomSections",
  []
);


// Display custom sections on the public portfolio.
function renderCustomSections() {

  const publicContainer = $("#customSections");

  const manageContainer = $("#manageCustomSections");

  publicContainer.innerHTML = "";

  manageContainer.innerHTML = "";


  if (customSections.length === 0) {

    manageContainer.innerHTML =
      '<p class="empty-state">No custom sections created yet.</p>';

    return;

  }


  customSections.forEach((section, index) => {

    // Public section.
    const card = document.createElement("article");

    card.className = "panel education-panel custom-section-card";


    const label = document.createElement("p");

    label.className = "eyebrow";

    label.textContent = "ADDITIONAL INFORMATION";


    const heading = document.createElement("h2");

    heading.textContent = section.title;


    const description = document.createElement("p");

    description.textContent = section.description;


    card.append(label, heading, description);

    publicContainer.appendChild(card);


    // Management section.
    const item = document.createElement("div");

    item.className = "manage-item";


    const info = document.createElement("div");

    info.className = "manage-item-info";


    const title = document.createElement("strong");

    title.textContent = section.title;


    const details = document.createElement("small");

    details.textContent = section.description;


    info.append(title, details);


    const actions = document.createElement("div");

    actions.className = "manage-actions";


    // Edit button.
    const editButton = document.createElement("button");

    editButton.className = "mini-btn";

    editButton.type = "button";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      editCustomSection(index);
    });


    // Delete button.
    const deleteButton = document.createElement("button");

    deleteButton.className = "mini-btn delete";

    deleteButton.type = "button";

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteCustomSection(index);
    });


    actions.append(editButton, deleteButton);

    item.append(info, actions);

    manageContainer.appendChild(item);

  });

}


// Save custom sections.
function saveCustomSections() {

  writeStorage("pavanCustomSections", customSections);

  renderCustomSections();

}


// Add a custom section.
$("#customSectionForm").addEventListener("submit", event => {

  event.preventDefault();

  const title = $("#customSectionTitle").value.trim();

  const description = $("#customSectionDescription").value.trim();


  if (!title || !description) {

    showToast("Please enter a title and section details.");

    return;

  }


  customSections.push({

    id: Date.now(),

    title: title,

    description: description

  });


  saveCustomSections();

  $("#customSectionForm").reset();

  showToast("Custom section added successfully!");

});


// Edit a custom section.
function editCustomSection(index) {

  const current = customSections[index];


  const newTitle = prompt(
    "Edit section title:",
    current.title
  );

  if (newTitle === null) return;


  const newDescription = prompt(
    "Edit section details:",
    current.description
  );

  if (newDescription === null) return;


  if (!newTitle.trim() || !newDescription.trim()) {

    showToast("Section title and details cannot be empty.");

    return;

  }


  customSections[index] = {

    ...current,

    title: newTitle.trim(),

    description: newDescription.trim()

  };


  saveCustomSections();

  showToast("Custom section updated!");

}


// Delete a custom section.
function deleteCustomSection(index) {

  const title = customSections[index].title;


  if (!confirm(`Delete "${title}" section?`)) {
    return;
  }


  customSections.splice(index, 1);

  saveCustomSections();

  showToast("Custom section deleted.");

}


renderCustomSections();


/* =====================================
   TO-DO LIST WITH DATE, TIME AND EDIT
===================================== */

// Read existing tasks from localStorage.
let tasks = readStorage("pavanTasks", []);
let taskFilter = "all";
let editingTaskId = null;


// Save tasks.
function saveTasks() {
  writeStorage("pavanTasks", tasks);
}


// Format the due date and time.
function formatTaskDateTime(task) {
  let result = [];

  // Format date without timezone conversion.
  if (task.date) {
    const parts = task.date.split("-");

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    const formattedDate = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    result.push(formattedDate);
  }

  // Add task time.
  if (task.time) {
    result.push(task.time);
  }

  if (result.length === 0) {
    return "No due date or time";
  }

  return "Due: " + result.join(" at ");
}


// Reset task form.
function resetTaskForm() {
  $("#taskForm").reset();

  editingTaskId = null;

  const submitButton = $('#taskForm button[type="submit"]');

  if (submitButton) {
    submitButton.textContent = "Add Task";
  }
}


// Display tasks.
function renderTasks() {
  const list = $("#taskList");

  list.innerHTML = "";

  // Apply selected filter.
  const visibleTasks = tasks.filter(task => {
    if (taskFilter === "active") {
      return !task.completed;
    }

    if (taskFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  // Update total task count.
  $("#taskCount").textContent =
    `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;

  // Update completed task count.
  const completedCount = tasks.filter(
    task => task.completed
  ).length;

  $("#taskProgress").textContent =
    `${completedCount} of ${tasks.length} completed`;

  // Display message if there are no tasks.
  if (visibleTasks.length === 0) {
    list.innerHTML =
      '<p class="empty-state">No tasks here. Add a task to get started!</p>';

    return;
  }

  // Create each task.
  visibleTasks.forEach(task => {
    const item = document.createElement("div");

    item.className = `task-item ${task.completed ? "completed" : ""}`;

    // Checkbox.
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.setAttribute(
      "aria-label",
      "Mark task completed"
    );

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;

      saveTasks();
      renderTasks();
    });

    // Task name and due date/time.
    const details = document.createElement("div");

    details.className = "task-details";

    const text = document.createElement("span");

    text.textContent = task.text;

    const dueDate = document.createElement("small");

    dueDate.textContent = formatTaskDateTime(task);

    details.append(text, dueDate);

    // Edit button.
    const editButton = document.createElement("button");

    editButton.className = "task-edit";
    editButton.type = "button";
    editButton.textContent = "Edit";

    editButton.setAttribute(
      "aria-label",
      "Edit task"
    );

    editButton.addEventListener("click", () => {
      $("#taskInput").value = task.text;

      $("#taskDate").value = task.date || "";

      $("#taskTime").value = task.time || "";

      editingTaskId = task.id;

      const submitButton = $('#taskForm button[type="submit"]');

      if (submitButton) {
        submitButton.textContent = "Update Task";
      }

      $("#taskInput").focus();

      showToast("Edit your task and save the changes.");
    });

    // Delete button.
    const deleteButton = document.createElement("button");

    deleteButton.className = "task-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "×";

    deleteButton.setAttribute(
      "aria-label",
      "Delete task"
    );

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(
        savedTask => savedTask.id !== task.id
      );

      if (editingTaskId === task.id) {
        resetTaskForm();
      }

      saveTasks();
      renderTasks();

      showToast("Task deleted successfully!");
    });

    // Add elements to task card.
    item.append(
      checkbox,
      details,
      editButton,
      deleteButton
    );

    list.appendChild(item);
  });
}


// Add or update a task.
$("#taskForm").addEventListener("submit", event => {
  event.preventDefault();

  const input = $("#taskInput");

  const text = input.value.trim();

  const date = $("#taskDate").value;

  const time = $("#taskTime").value;

  if (!text) return;

  // Update existing task.
  if (editingTaskId !== null) {
    const task = tasks.find(
      savedTask => savedTask.id === editingTaskId
    );

    if (task) {
      task.text = text;
      task.date = date;
      task.time = time;
    }

    showToast("Task updated successfully!");
  }

  // Add new task.
  else {
    tasks.unshift({
      id: Date.now(),
      text: text,
      date: date,
      time: time,
      completed: false
    });

    showToast("Task added successfully!");
  }

  saveTasks();

  renderTasks();

  resetTaskForm();

  input.focus();
});


// Filter tasks.
$$("[data-task-filter]").forEach(button => {
  button.addEventListener("click", () => {
    taskFilter = button.dataset.taskFilter;

    $$("[data-task-filter]").forEach(item => {
      item.classList.toggle(
        "active",
        item === button
      );
    });

    renderTasks();
  });
});


// Clear completed tasks.
$("#clearCompleted").addEventListener("click", () => {
  const completed = tasks.filter(
    task => task.completed
  ).length;

  if (!completed) {
    showToast("There are no completed tasks.");
    return;
  }

  // Reset editing if the edited task is being removed.
  const editedTask = tasks.find(
    task => task.id === editingTaskId
  );

  if (editedTask && editedTask.completed) {
    resetTaskForm();
  }

  tasks = tasks.filter(
    task => !task.completed
  );

  saveTasks();

  renderTasks();

  showToast("Completed tasks cleared.");
});


// Initial display.
renderTasks();



/* =====================================
   PRODUCT LISTING
===================================== */

const products = [

  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 1499,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",
    search: "wireless headphones"
  },

  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 2299,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
    search: "smart watch"
  },

  {
    id: 3,
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 1199,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700",
    search: "bluetooth speaker"
  },

  {
    id: 4,
    name: "Camera",
    category: "Electronics",
    price: 25999,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700",
    search: "digital camera"
  },

  {
    id: 5,
    name: "Laptop",
    category: "Electronics",
    price: 45999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700",
    search: "laptop"
  },

  {
    id: 6,
    name: "Gaming Controller",
    category: "Accessories",
    price: 1899,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=700",
    search: "gaming controller"
  },

  {
    id: 7,
    name: "Travel Backpack",
    category: "Lifestyle",
    price: 999,
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700",
    search: "travel backpack"
  },

  {
    id: 8,
    name: "Sunglasses",
    category: "Lifestyle",
    price: 799,
    rating: 4.0,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700",
    search: "sunglasses"
  },

  {
    id: 9,
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 2499,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700",
    search: "mechanical keyboard"
  },

  {
    id: 10,
    name: "Running Shoes",
    category: "Lifestyle",
    price: 1799,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
    search: "running shoes"
  },

  {
    id: 11,
    name: "Wireless Mouse",
    category: "Accessories",
    price: 699,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=700",
    search: "wireless mouse"
  },

  {
    id: 12,
    name: "Desk Lamp",
    category: "Lifestyle",
    price: 899,
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700",
    search: "desk lamp"
  }

];


// Display products with search, filter and sorting.
function renderProducts() {

  const grid = $("#productsGrid");

  const searchTerm = $("#productSearch").value.trim().toLowerCase();

  const category = $("#categoryFilter").value;

  const sort = $("#sortProducts").value;


  // Filter products.
  let filtered = products.filter(product => {

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);


    const matchesCategory =
      category === "all" ||
      product.category === category;


    return matchesSearch && matchesCategory;

  });


  // Sort products.
  if (sort === "rating") {

    filtered.sort((a, b) => b.rating - a.rating);

  } else if (sort === "price-low") {

    filtered.sort((a, b) => a.price - b.price);

  } else if (sort === "price-high") {

    filtered.sort((a, b) => b.price - a.price);

  } else if (sort === "name") {

    filtered.sort((a, b) => a.name.localeCompare(b.name));

  }


  $("#productResultCount").textContent =
    `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`;


  grid.innerHTML = "";


  if (filtered.length === 0) {

    grid.innerHTML =
      '<p class="empty-state">No products found. Try another search.</p>';

    return;

  }


  // Create product cards.
  filtered.forEach(product => {

    const card = document.createElement("article");

    card.className = "panel product-card";


    const imageWrap = document.createElement("div");

    imageWrap.className = "product-image-wrap";


    const image = document.createElement("img");

    image.className = "product-image";

    image.src = product.image;

    image.alt = product.name;

    image.loading = "lazy";


    image.addEventListener("error", () => {

      image.remove();

      const fallback = document.createElement("div");

      fallback.className = "product-image-fallback";

      fallback.textContent = "▦";

      imageWrap.appendChild(fallback);

    }, { once: true });


    imageWrap.appendChild(image);


    const info = document.createElement("div");

    info.className = "product-info";


    const categoryText = document.createElement("span");

    categoryText.className = "product-category";

    categoryText.textContent = product.category;


    const title = document.createElement("h3");

    title.textContent = product.name;


    const meta = document.createElement("div");

    meta.className = "product-meta";


    const price = document.createElement("strong");

    price.className = "product-price";

    price.textContent =
      `₹${product.price.toLocaleString("en-IN")}`;


    const rating = document.createElement("span");

    rating.className = "product-rating";

    rating.textContent = `★ ${product.rating}`;


    meta.append(price, rating);


    const buyLink = document.createElement("a");

    buyLink.className = "product-buy";

    buyLink.href =
      `https://www.amazon.in/s?k=${encodeURIComponent(product.search)}`;

    buyLink.target = "_blank";

    buyLink.rel = "noopener noreferrer";

    buyLink.textContent = "View Product ↗";


    info.append(
      categoryText,
      title,
      meta,
      buyLink
    );

    card.append(imageWrap, info);

    grid.appendChild(card);

  });

}


// Product search.
$("#productSearch").addEventListener("input", renderProducts);


// Category filter.
$("#categoryFilter").addEventListener("change", renderProducts);


// Product sorting.
$("#sortProducts").addEventListener("change", renderProducts);


renderProducts();


/* =====================================
   CONTACT FORM
===================================== */

// This form does not send emails.
// It only displays a thank-you message.

$("#contactForm").addEventListener("submit", event => {

  event.preventDefault();


  const form = event.currentTarget;

  const status = $("#contactStatus");


  // Check that all required fields are valid.
  if (!form.reportValidity()) {
    return;
  }


  // Display thank-you message immediately.
  status.textContent = "Thank you for contacting me!";

  status.className = "form-status success";


  // Show a notification.
  showToast("Thank you for contacting me!");


  // Clear the form.
  form.reset();

});