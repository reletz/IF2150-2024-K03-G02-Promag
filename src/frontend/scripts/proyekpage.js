import { createButton } from "../components/buttonComponent.js";

// ===== GLOBAL VARIABLES =====
let currentProjectId = null;

// ===== NAVIGATION APIs =====
function navigateToMainPage() {
  window.electronAPI.navigateToMainPage();
}

function navigateToAddTaskPage() {
  window.location.href = `addtaskpage.html?`;
}

function navigateToTugasPage(taskId = null) {
  if (taskId) {
    window.location.href = `tugaspage.html?projectId=${currentProjectId}&taskId=${taskId}`;
  } else {
    window.location.href = `tugaspage.html?projectId=${currentProjectId}`;
  }
}

// ===== BUTTON: NAVIGATE TO MAIN PAGE & ADD TASK =====
const footer = document.getElementById("footer");
const backButton = createButton("BACK MAIN", navigateToMainPage, "medium");
const addTask = createButton("ADD TASK", navigateToAddTaskPage, "medium");

// Create Pagination Container
const paginationContainer = document.createElement("div");
paginationContainer.classList.add("pagination-container");

// Append Back Button to Pagination Container
paginationContainer.appendChild(backButton);
paginationContainer.appendChild(addTask);

if (footer) {
  footer.appendChild(paginationContainer);
} else {
  console.error("Footer Container not found.");
}

// ===== RENDER PROJECT DETAILS =====
async function renderProjectDetails() {
  // Parse passed projectID from the URL
  const params = new URLSearchParams(window.location.search);
  const projectId = parseInt(params.get("id"), 10);

  // projectID validation
  if (isNaN(projectId)) {
    console.error("Invalid or missing project ID in the URL.");
    displayErrorMessage("Invalid project ID specified.");
    return;
  }

  // Fetch data
  const data = await window.electronAPI.getProjectData();

  // Fetch project with specified ID
  const project = data.projects.find((proj) => proj.id === projectId);

  // Project existence validation
  if (!project) {
    console.error(`Project with ID "${projectId}" not found.`);
    displayErrorMessage("Project not found.");
    return;
  }

  // Get latest task deadline from tasks
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

// ===== FUNCTION TO GET LATEST TASK DEADLINE =====
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

  const projectHeader = document.createElement("div");
  projectHeader.classList.add("project-header");

  const title = document.createElement("h1");
  title.textContent = project.title;

  const startDateCapsule = document.createElement("span");
  startDateCapsule.classList.add("date-capsule");
  startDateCapsule.textContent = project.startDate;

  const endDateCapsule = document.createElement("span");
  endDateCapsule.classList.add("date-capsule");
  endDateCapsule.textContent = project.endDate || "Ongoing";

  projectHeader.appendChild(title);
  projectHeader.appendChild(startDateCapsule);
  projectHeader.appendChild(endDateCapsule);

  header.appendChild(projectHeader);

  const description = document.createElement("p");
  const maxLength = 200;
  description.textContent =
    project.description.length > maxLength ? project.description.substring(0, maxLength) + "..." : project.description;
  header.appendChild(description);

  // ===== ADD PROGRESS BAR =====
  const progressBarContainer = document.createElement("div");
  progressBarContainer.classList.add("progress-bar-container");

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  // Calculate progress
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.complete).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  progressBar.style.width = `${progressPercent}%`;

  progressBarContainer.appendChild(progressBar);
  header.appendChild(progressBarContainer);

  // ===== ADD PROGRESS LABELS =====
  const progressLabels = document.createElement("div");
  progressLabels.classList.add("progress-labels");

  const progressText = document.createElement("span");
  progressText.textContent = "Progress";

  const progressPercentage = document.createElement("span");
  progressPercentage.textContent = `${progressPercent}%`;

  progressLabels.appendChild(progressText);
  progressLabels.appendChild(progressPercentage);
  header.appendChild(progressLabels);
}

// ===== DISPLAY TASK LIST =====
let currentPage = 1;
const tasksPerPage = 3;

// ===== DISPLAY TASK LIST =====
function displayTaskList(project) {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  if (project.tasks && project.tasks.length > 0) {
    // ===== REMOVE TASKS HEADER =====
    // const tasksHeader = document.createElement("h2");
    // tasksHeader.textContent = "Tasks";
    // taskList.appendChild(tasksHeader);

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");

    // Calculate pagination
    const totalTasks = project.tasks.length;
    const totalPages = Math.ceil(totalTasks / tasksPerPage);
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const tasksToDisplay = project.tasks.slice(startIndex, endIndex);

    tasksToDisplay.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");

      // ===== Task Info =====
      const taskInfo = document.createElement("div");
      taskInfo.classList.add("task-info");

      const row = document.createElement("div");
      row.classList.add("row");

      const taskTitle = document.createElement("h3");
      taskTitle.textContent = task.title;

      // ===== Deadline Date =====
      const deadlineDate = document.createElement("div");
      deadlineDate.classList.add("deadline-capsule");
      deadlineDate.textContent = `${task.deadlineDate}`;

      // ===== Days Left =====
      const daysLeft = document.createElement("div");
      daysLeft.classList.add("days-left-capsule");
      const remainingDays = calculateDaysLeft(task.deadlineDate);
      daysLeft.textContent = `${remainingDays} day${remainingDays !== 1 ? "s" : ""} left`;

      // Append Title, Deadline, and Days Left to Row
      row.appendChild(taskTitle);
      row.appendChild(deadlineDate);
      row.appendChild(daysLeft);

      taskInfo.appendChild(row);

      const taskDescription = document.createElement("p");
      taskDescription.textContent = task.description.length > 200 ? task.description.substring(0, 200) + "..." : task.description;
      taskInfo.appendChild(taskDescription);

      // ===== Priority Status =====
      const priorityStatus = document.createElement("div");
      priorityStatus.classList.add("priority-status");
      switch (task.priority.toLowerCase()) {
        case "high":
          priorityStatus.classList.add("priority-high");
          priorityStatus.textContent = "High";
          break;
        case "medium":
          priorityStatus.classList.add("priority-medium");
          priorityStatus.textContent = "Medium";
          break;
        case "low":
          priorityStatus.classList.add("priority-low");
          priorityStatus.textContent = "Low";
          break;
        default:
          priorityStatus.style.display = "none"; // Hide if priority is undefined
      }

      // ===== Details Button =====
      const taskButton = createButton(
        "Details",
        () => {
          navigateToTugasPage(task.id);
        },
        "small"
      );

      // ===== Task Actions =====
      const taskActions = document.createElement("div");
      taskActions.classList.add("task-actions");

      taskActions.appendChild(priorityStatus);
      taskActions.appendChild(taskButton);

      // ===== Append to Task Item =====
      taskItem.appendChild(taskInfo);
      taskItem.appendChild(taskActions);

      tasksContainer.appendChild(taskItem);
    });

    taskList.appendChild(tasksContainer);

    // ===== ADD PAGINATION BUTTONS =====
    if (totalPages > 1) {
      // Remove existing pagination buttons
      paginationContainer.innerHTML = "";
      paginationContainer.appendChild(backButton);

      // Previous Button
      if (currentPage > 1) {
        const prevButton = createButton(
          "Previous",
          () => {
            currentPage--;
            displayTaskList(project);
          },
          "small"
        );
        paginationContainer.appendChild(prevButton);
      }

      // Next Button
      if (currentPage < totalPages) {
        const nextButton = createButton(
          "Next",
          () => {
            currentPage++;
            displayTaskList(project);
          },
          "small"
        );
        paginationContainer.appendChild(nextButton);
      }

      taskList.appendChild(paginationContainer);
    }
  } else {
    const noTasks = document.createElement("p");
    noTasks.textContent = "No tasks for this project.";
    taskList.appendChild(noTasks);
  }
}

// ===== HELPER FUNCTION TO CALCULATE DAYS LEFT =====
function calculateDaysLeft(deadlineDate) {
  const today = new Date();
  const deadline = new Date(deadlineDate);
  const timeDiff = deadline - today;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysLeft >= 0 ? daysLeft : 0;
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