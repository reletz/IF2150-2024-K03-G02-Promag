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
const mainButtonContainer = document.getElementById("navigate-to-main-button");
const backButton = createButton("Back to Main Page", navigateToMainPage, "medium");

if (mainButtonContainer) {
  mainButtonContainer.appendChild(backButton);
} else {
  console.error("Main Button Container not found.");
}

// ===== BUTTON: NAVIGATE TO TUGAS PAGE =====
const tugasButtonContainer = document.getElementById("navigate-to-tugaspage-button");
let currentProjectId = null;

const navigateButton = createButton(
  "Go to Tugas Page",
  () => {
    if (currentProjectId !== null) {
      navigateToTugasPage(currentProjectId);
    } else {
      console.error("Current Project ID is not set.");
    }
  },
  "medium"
);

if (tugasButtonContainer) {
  tugasButtonContainer.appendChild(navigateButton);
} else {
  console.error("Tugas Button Container not found.");
}

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
    project.endTime = latestDeadline.toTimeString().split(" ")[0];
  } else {
    project.endDate = null;
    project.endTime = null;
  }

  currentProjectId = project.id;
  displayProjectDetails(project);
}

// ===== GET LATEST TASK DEADLINE =====
function getLatestTaskDeadline(tasks) {
  if (!tasks || tasks.length === 0) return null;

  const deadlines = tasks.map((task) => {
    const date = task.deadlineDate;
    const time = task.deadlineTime;
    return new Date(`${date}T${time}`);
  });

  return deadlines.reduce((latest, current) => (current > latest ? current : latest), deadlines[0]);
}

// ===== DISPLAY PROJECT DETAILS =====
function displayProjectDetails(project) {
  const container = document.getElementById("project-details");

  container.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = project.title;

  const startDate = document.createElement("p");
  startDate.textContent = `Start Date: ${project.startDate}`;

  const endDate = document.createElement("p");
  endDate.textContent = `End Date: ${project.endDate || "Ongoing"}`;

  const endTime = document.createElement("p");
  endTime.textContent = `End Time: ${project.endTime || ""}`;

  const description = document.createElement("p");
  description.textContent = project.description;

  container.appendChild(title);
  container.appendChild(startDate);
  container.appendChild(endDate);
  container.appendChild(endTime);
  container.appendChild(description);

  // ===== DISPLAY TASKS =====
  if (project.tasks && project.tasks.length > 0) {
    const tasksHeader = document.createElement("h2");
    tasksHeader.textContent = "Tasks";
    container.appendChild(tasksHeader);

    const tasksList = document.createElement("ul");

    project.tasks.forEach((task) => {
      const taskItem = document.createElement("li");

      const taskTitle = document.createElement("h3");
      taskTitle.textContent = task.title;

      const taskDescription = document.createElement("p");
      taskDescription.textContent = task.description;

      const taskButton = createButton(
        "View Task",
        () => {
          navigateToTugasPage(project.id, task.id);
        },
        "small"
      );

      taskItem.appendChild(taskTitle);
      taskItem.appendChild(taskDescription);
      taskItem.appendChild(taskButton);

      tasksList.appendChild(taskItem);
    });

    container.appendChild(tasksList);
  } else {
    const noTasks = document.createElement("p");
    noTasks.textContent = "No tasks for this project.";
    container.appendChild(noTasks);
  }
}

function displayErrorMessage(message) {
  const container = document.getElementById("project-details");
  container.innerHTML = "";

  const errorMsg = document.createElement("p");
  errorMsg.textContent = message;
  errorMsg.style.color = "red";

  container.appendChild(errorMsg);
}

// ===== INITIALIZE =====
renderProjectDetails();
