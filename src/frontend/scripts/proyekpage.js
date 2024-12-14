import { createButton } from "../components/buttonComponent.js";

// ===== HELPER FUNCTION TO FORMAT DATE =====
function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
}
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

// ===== BUTTONS: NAVIGATE TO MAIN PAGE & MORE ACTION =====
const footer = document.getElementById("footer");
// ===== BUTTON: NAVIGATE TO MAIN PAGE & ADD TASK =====
const backButton = createButton("BACK MAIN", navigateToMainPage, "medium");
const addTask = createButton("ADD TASK", navigateToAddTaskPage, "medium");
const moreActionButton = createButton("MORE ACTION", () => {
  showActionPopup();
}, "medium");

// Create Footer Container
const footerContainer = document.createElement("div");
footerContainer.classList.add("footer-container");

// Append Buttons to Footer Container
footerContainer.appendChild(moreActionButton);
footerContainer.appendChild(backButton);
footerContainer.appendChild(addTask);

// Append Footer Container to Footer
if (footer) {
  footer.appendChild(footerContainer);
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
  startDateCapsule.textContent = formatDate(project.startDate);

  const endDateCapsule = document.createElement("span");
  endDateCapsule.classList.add("date-capsule");
  endDateCapsule.textContent = project.endDate ? formatDate(project.endDate) : "Ongoing";

  projectHeader.appendChild(title);
  projectHeader.appendChild(startDateCapsule);
  projectHeader.appendChild(endDateCapsule);

  header.appendChild(projectHeader);

  const description = document.createElement("p");
  const maxLength = 200;
  description.textContent = project.description.length > maxLength
    ? project.description.substring(0, maxLength) + '...'
    : project.description;
  header.appendChild(description);

  // ===== ADD PROGRESS BAR =====
  const progressBarContainer = document.createElement("div");
  progressBarContainer.classList.add("progress-bar-container");

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  // Calculate progress
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(task => task.complete).length;
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

      // ===== Status =====
      const statusDiv = document.createElement("div");
      statusDiv.classList.add("status-capsule");
      
      // Updated Status Text Based on 'complete' Value
      switch (task.complete) {
        case 0:
          statusDiv.textContent = "Not Started";
          break;
        case 1:
          statusDiv.textContent = "On Progress";
          break;
        case 2:
          statusDiv.textContent = "Done";
          break;
        default:
          statusDiv.textContent = "Unknown";
      }

      // Append Title, Deadline, and Days Left to Row
      row.appendChild(taskTitle);
      row.appendChild(deadlineDate);
      row.appendChild(daysLeft);
      row.appendChild(statusDiv);

      taskInfo.appendChild(row);

      const taskDescription = document.createElement("p");
      taskDescription.textContent = task.description.length > 200
        ? task.description.substring(0, 200) + '...'
        : task.description;
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

    // ===== REMOVE PAGINATION BUTTONS =====
    // Pagination is removed to allow scrolling
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

// ===== ACTION POPUP =====
function showActionPopup() {
  // Create Overlay
  const overlay = document.createElement("div");
  overlay.classList.add("action-popup-overlay");

  // Create Popup Container
  const popup = document.createElement("div");
  popup.classList.add("action-popup");

  // Create Close Button
  const closeButton = document.createElement("span");
  closeButton.classList.add("close-button");
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };

  // Create Header
  const header = document.createElement("h1");
  header.textContent = "Action";

  // Create Action Items
  const action1 = document.createElement("p");
  action1.textContent = "Set Priority";
  action1.onclick = () => {
    // Implement Set Priority Action
    alert("Set Priority Clicked");
  };

  const action2 = document.createElement("p");
  action2.textContent = "Set Status";
  action2.onclick = () => {
    // Implement Set Status Action
    alert("Set Status Clicked");
  };

  const action3 = document.createElement("p");
  action3.textContent = "Set Deadline";
  action3.onclick = () => {
    // Implement Set Deadline Action
    alert("Set Deadline Clicked");
  };

  // Append Elements to Popup
  popup.appendChild(closeButton);
  popup.appendChild(header);
  popup.appendChild(action1);
  popup.appendChild(action2);
  popup.appendChild(action3);

  // Append Popup to Overlay
  overlay.appendChild(popup);

  // Append Overlay to Body
  document.body.appendChild(overlay);
}

// ===== INITIALIZE =====
renderProjectDetails();