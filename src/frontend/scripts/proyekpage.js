import { createButton } from "../components/buttonComponent.js";

// ===== HELPER FUNCTION TO FORMAT DATE =====
function formatDate(dateString) {
  const options = { day: "numeric", month: "long", year: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", options);
}

// ===== GLOBAL VARIABLES =====
let currentProjectId = null;

// ===== NAVIGATION APIs =====
function navigateToMainPage() {
  window.electronAPI.navigateToMainPage();
}

function navigateToTugasPage(taskId = null) {
  if (taskId) {
    window.location.href = `tugaspage.html?projectId=${currentProjectId}&taskId=${taskId}`;
  } else {
    window.location.href = `tugaspage.html?projectId=${currentProjectId}`;
  }
}

function navigateToCreateTugasPage(currentProjectId) {
  window.location.href = `addtaskpage.html?projectId=${currentProjectId}`;
}

// ===== BUTTONS: NAVIGATE TO MAIN PAGE & MORE ACTION =====
const footer = document.getElementById("footer");

// Create Back Button
const backButton = createButton("BACK", navigateToMainPage, "medium");

// Create Task Button
const createTaskButton = createButton(
  "+",
  () => {
    navigateToCreateTugasPage(currentProjectId);
  },
  "medium"
);

// Create More Action Button
const moreActionButton = createButton(
  "More Action",
  () => {
    showActionPopup();
  },
  "medium"
);

// Create Footer Container
// Create Footer Container
const footerContainer = document.createElement("div");
footerContainer.classList.add("footer-container");

// Create Left Group Container
const leftGroup = document.createElement("div");
leftGroup.classList.add("left-group");

// Append More Action and Create Task Buttons to Left Group
leftGroup.appendChild(moreActionButton);
leftGroup.appendChild(createTaskButton);

// Create Right Group Container
const rightGroup = document.createElement("div");
rightGroup.classList.add("right-group");

// Append Back Button to Right Group
rightGroup.appendChild(backButton);

// Append Left and Right Groups to Footer Container
footerContainer.appendChild(leftGroup);
footerContainer.appendChild(rightGroup);

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

  // Fetch project dengan ID tertentu
  const project = data.projects.find((proj) => proj.id === projectId);

  // Validasi keberadaan project
  if (!project) {
    console.error(`Project dengan ID "${projectId}" tidak ditemukan.`);
    displayErrorMessage("Project tidak ditemukan.");
    return;
  }

  // Dapatkan deadline tugas terbaru
  const latestDeadline = getLatestTaskDeadline(project.tasks);
  if (latestDeadline) {
    project.endDate = latestDeadline.toISOString().split("T")[0];
  } else {
    project.endDate = null;
  }

  currentProjectId = project.id;
  displayHeader(project);
  displayTaskList(project);

  // Cek deadline mendatang
  checkForUpcomingDeadlines(project);
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
  description.textContent =
    project.description.length > maxLength ? project.description.substring(0, maxLength) + "..." : project.description;
  header.appendChild(description);

  // ===== ADD PROGRESS BAR =====
  const progressBarContainer = document.createElement("div");
  progressBarContainer.classList.add("progress-bar-container");

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  // Hitung progress
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.complete === 2).length;
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
function displayTaskList(project) {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  if (project.tasks && project.tasks.length > 0) {
    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");

    project.tasks.forEach((task) => {
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

      switch (task.complete) {
        case 0:
          statusDiv.textContent = "Not Started";
          statusDiv.classList.add("status-not-started");
          break;
        case 1:
          statusDiv.textContent = "On Progress";
          statusDiv.classList.add("status-on-progress");
          break;
        case 2:
          statusDiv.textContent = "Done";
          statusDiv.classList.add("status-done");
          break;
        default:
          statusDiv.textContent = "Unknown";
          statusDiv.classList.add("status-unknown");
      }

      // Append Title, Deadline, and Days Left to Row
      row.appendChild(taskTitle);
      row.appendChild(deadlineDate);
      row.appendChild(daysLeft);
      row.appendChild(statusDiv);

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
          priorityStatus.textContent = "HIGH";
          break;
        case "medium":
          priorityStatus.classList.add("priority-medium");
          priorityStatus.textContent = "MEDIUM";
          break;
        case "low":
          priorityStatus.classList.add("priority-low");
          priorityStatus.textContent = "LOW";
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

// ===== CHECK FOR UPCOMING DEADLINES =====
function checkForUpcomingDeadlines(project) {
  const tasksToNotify = project.tasks.filter(
    (task) => calculateDaysLeft(task.deadlineDate) < 3 && calculateDaysLeft(task.deadlineDate) > 0
  );

  if (tasksToNotify.length > 0) {
    showDeadlineNotification(tasksToNotify);
  }
}

// ===== SHOW DEADLINE NOTIFICATION =====
function showDeadlineNotification(tasksToNotify) {
  let currentIndex = 0;

  function displayNotification(index) {
    // Remove any existing overlay
    const existingOverlay = document.querySelector(".deadline-popup-overlay");
    if (existingOverlay) {
      document.body.removeChild(existingOverlay);
    }

    const task = tasksToNotify[index];

    // Create Overlay
    const overlay = document.createElement("div");
    overlay.classList.add("deadline-popup-overlay");

    // Create Popup Container
    const popup = document.createElement("div");
    popup.classList.add("deadline-popup");

    // Create Header
    const header = document.createElement("h1");
    header.textContent = "Deadline Tugas Mendekat";

    // Create Message
    const message = document.createElement("p");
    message.textContent = `Jangan lupa untuk selesaikan "${task.title}" sebelum deadline pada ${formatDate(task.deadlineDate)}.`;

    // Create Button
    const button = createButton("", null, "small");

    if (tasksToNotify.length === 1 || index === tasksToNotify.length - 1) {
      button.textContent = "Okay";
      button.onclick = () => {
        document.body.removeChild(overlay);
      };
    } else {
      button.textContent = "Next Notification";
      button.onclick = () => {
        displayNotification(index + 1);
      };
    }

    // Append Elements to Popup
    popup.appendChild(header);
    popup.appendChild(message);
    popup.appendChild(button);

    // Append Popup to Overlay
    overlay.appendChild(popup);

    // Append Overlay to Body
    document.body.appendChild(overlay);
  }

  // Mulai dengan menampilkan notifikasi pertama
  displayNotification(currentIndex);
}

// ===== INITIALIZE =====
renderProjectDetails();
