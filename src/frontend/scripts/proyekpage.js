// src/frontend/scripts/proyekpage.js

import { createButton } from "../components/buttonComponent.js";

// ===== NAVIGATION APIs =====
function navigateToMainPage() {
  window.electronAPI.navigateToMainPage();
}

function navigateToTugasPage(projectId, taskId = null) {
  if (taskId) {
    window.location.href = `tugaspage.html?projectId=${projectId}&taskId=${taskId}`;
  } else {
    window.location.href = `tugaspage.html?projectId=${projectId}`;
  }
}

// ===== BUTTON: NAVIGATE TO MAIN PAGE =====
const footer = document.getElementById("footer");
const backButton = createButton("Back to Main Page", navigateToMainPage, "medium");

if (footer) {
  footer.appendChild(backButton);
} else {
  console.error("Footer Container not found.");
}

let currentProjectId = null;

// ===== RENDER PROJECT DETAILS =====
async function renderProjectDetails() {
  const params = new URLSearchParams(window.location.search);
  const projectId = parseInt(params.get("id"), 10);

  if (isNaN(projectId)) {
    console.error("Invalid or missing project ID in the URL.");
    displayErrorMessage("Invalid project ID specified.");
    return;
  }

  const data = await window.electronAPI.getProjectData();

  const project = data.projects.find((proj) => proj.id === projectId);

  if (!project) {
    console.error(`Project with ID "${projectId}" not found.`);
    displayErrorMessage("Project not found.");
    return;
  }

  const latestDeadline = getLatestTaskDeadline(project.tasks);
  if (latestDeadline) {
    project.endDate = latestDeadline.toISOString().split("T")[0];
  } else {
    project.endDate = null;
  }

  currentProjectId = project.id;
  displayHeader(project);
  displayTaskList(project);
}

// ===== HELPER FUNCTION TO GET LATEST TASK DEADLINE =====
function getLatestTaskDeadline(tasks) {
  if (!tasks || tasks.length === 0) return null;

  const deadlines = tasks.map((task) => {
    const date = task.deadlineDate;
    const time = task.deadlineTime;
    return new Date(`${date}T${time}`);
  });

  return deadlines.reduce((latest, current) => (current > latest ? current : latest), deadlines[0]);
}

// ===== DISPLAY HEADER =====
function displayHeader(project) {
  const header = document.getElementById("header");

  const title = document.createElement("h1");
  title.textContent = project.title;

  const startDate = document.createElement("p");
  startDate.textContent = `Start Date: ${project.startDate}`;

  const endDate = document.createElement("p");
  endDate.textContent = `End Date: ${project.endDate || "Ongoing"}`;

  const description = document.createElement("p");
  description.textContent = project.description;

  header.appendChild(title);
  header.appendChild(startDate);
  header.appendChild(endDate);
  header.appendChild(description);
}

// ===== DISPLAY TASK LIST =====
function displayTaskList(project) {
  const taskList = document.getElementById("task-list");

  if (project.tasks && project.tasks.length > 0) {
    const tasksHeader = document.createElement("h2");
    tasksHeader.textContent = "Progress";
    taskList.appendChild(tasksHeader);

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");

    project.tasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");

      const taskTitle = document.createElement("h3");
      taskTitle.textContent = task.title;

      const taskDescription = document.createElement("p");
      taskDescription.textContent = task.description;

      const taskButton = createButton(
        "Details",
        () => {
          navigateToTugasPage(project.id, task.id);
        },
        "small"
      );

      taskItem.appendChild(taskTitle);
      taskItem.appendChild(taskDescription);
      taskItem.appendChild(taskButton);

      tasksContainer.appendChild(taskItem);
    });

    taskList.appendChild(tasksContainer);
  } else {
    const noTasks = document.createElement("p");
    noTasks.textContent = "No tasks for this project.";
    taskList.appendChild(noTasks);
  }
}

// ===== DISPLAY ERROR MESSAGE =====
function displayErrorMessage(message) {
  const header = document.getElementById("header");
  header.innerHTML = "";

  const errorMsg = document.createElement("p");
  errorMsg.textContent = message;
  errorMsg.style.color = "red";

  header.appendChild(errorMsg);
}

// ===== INITIALIZE =====
renderProjectDetails();
