// src/frontend/scripts/tugaspage.js

import { createButton, createDropdown } from "../components/buttonComponent.js";
import { openFileDialog } from "../components/fileDialog.js"; // Assume you have a file dialog component

// ===== NAVIGATION APIs =====
function navigateToMainPage() {
  window.electronAPI.navigateToMainPage();
}

function navigateBackToProjectPage(projectId) {
  window.location.href = `proyekpage.html?id=${projectId}`;
}

// ===== BUTTON: NAVIGATE TO MAIN PAGE =====
const footer = document.getElementById("footer");
const backButton = createButton("BACK TO PROJECTS", navigateToMainPage, "medium");

if (footer) {
  footer.appendChild(backButton);
} else {
  console.error("Footer Container not found.");
}

let currentProjectId = null;
let currentTaskId = null;

// ===== RENDER TASK DETAILS =====
async function renderTaskDetails() {
  const params = new URLSearchParams(window.location.search);
  const projectId = parseInt(params.get("projectId"), 10);
  const taskId = parseInt(params.get("taskId"), 10);

  if (isNaN(projectId) || isNaN(taskId)) {
    console.error("Invalid or missing project/task ID in the URL.");
    displayErrorMessage("Invalid project or task ID specified.");
    return;
  }

  const data = await window.electronAPI.getProjectData();

  const project = data.projects.find((proj) => proj.id === projectId);
  if (!project) {
    console.error(`Project with ID "${projectId}" not found.`);
    displayErrorMessage("Project not found.");
    return;
  }

  const task = project.tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error(`Task with ID "${taskId}" not found.`);
    displayErrorMessage("Task not found.");
    return;
  }

  currentProjectId = project.id;
  currentTaskId = task.id;

  displayHeader(task);
  displayComments(task);
}

// ===== DISPLAY HEADER =====
function displayHeader(task) {
  const header = document.getElementById("header");
  const deadlineCapsule = document.getElementById("deadlineCapsule");
  const priorityDropdown = document.getElementById("priorityDropdown");
  const statusDisplay = document.getElementById("statusDisplay");
  const tugasTitle = document.getElementById("tugasTitle");

  // Deadline Capsule
  const deadline = new Date(`${task.deadlineDate}T${task.deadlineTime}`);
  deadlineCapsule.textContent = `Deadline: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString()}`;

  // Priority Dropdown
  const priorities = ["High", "Medium", "Low"];
  const prioritySelect = createDropdown(
    "prioritySelect",
    priorities,
    task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
  );
  prioritySelect.addEventListener("change", (e) => {
    const newPriority = e.target.value.toLowerCase();
    updateTaskPriority(newPriority);
  });
  priorityDropdown.appendChild(prioritySelect);

  // Status Display
  const statuses = ["Not Started", "On Progress", "Finished"];
  const statusSelect = createDropdown(
    "statusSelect",
    statuses,
    task.complete ? "Finished" : "On Progress" // Assuming 'On Progress' if not complete
  );
  statusSelect.addEventListener("change", (e) => {
    const newStatus = e.target.value;
    updateTaskStatus(newStatus);
  });
  statusDisplay.appendChild(statusSelect);

  // Task Title
  tugasTitle.textContent = task.title;
}

// ===== DISPLAY COMMENTS =====
function displayComments(task) {
  const commentsDisplay = document.getElementById("commentsDisplay");
  commentsDisplay.innerHTML = ""; // Clear existing comments

  if (task.comments && task.comments.length > 0) {
    task.comments.forEach((comment, index) => {
      const commentDiv = document.createElement("div");
      commentDiv.classList.add("comment");
      commentDiv.textContent = `${index + 1}. ${comment}`;
      commentsDisplay.appendChild(commentDiv);
    });
  } else {
    const noComments = document.createElement("p");
    noComments.textContent = "No comments yet.";
    commentsDisplay.appendChild(noComments);
  }
}

// ===== ADD COMMENT =====
const addCommentBtn = document.getElementById("addCommentBtn");
addCommentBtn.addEventListener("click", () => {
  const newCommentInput = document.getElementById("newComment");
  const newComment = newCommentInput.value.trim();
  if (newComment === "") {
    alert("Please enter a comment.");
    return;
  }
  addComment(newComment);
  newCommentInput.value = "";
});

async function addComment(comment) {
  try {
    await window.electronAPI.addCommentToTask(currentProjectId, currentTaskId, comment);
    const data = await window.electronAPI.getProjectData();
    const project = data.projects.find((proj) => proj.id === currentProjectId);
    const task = project.tasks.find((t) => t.id === currentTaskId);
    displayComments(task);
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}

// ===== UPDATE TASK PRIORITY =====
async function updateTaskPriority(newPriority) {
  try {
    await window.electronAPI.updateTaskPriority(currentProjectId, currentTaskId, newPriority);
    // Optionally, show a success message
  } catch (error) {
    console.error("Error updating priority:", error);
  }
}

// ===== UPDATE TASK STATUS =====
async function updateTaskStatus(newStatus) {
  const isComplete = newStatus === "Finished";
  try {
    await window.electronAPI.updateTaskStatus(currentProjectId, currentTaskId, isComplete);
    // Optionally, show a success message
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

// ===== DELETE TASK =====
function deleteTask() {
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  window.electronAPI
    .deleteTask(currentProjectId, currentTaskId)
    .then(() => {
      alert("Task deleted successfully.");
      navigateBackToProjectPage(currentProjectId);
    })
    .catch((error) => {
      console.error("Error deleting task:", error);
      alert("Failed to delete task.");
    });
}

const deleteTugasDiv = document.getElementById("deleteTugas");
const deleteButton = createButton("DELETE TASK", deleteTask, "medium");
deleteTugasDiv.appendChild(deleteButton);

// ===== UPLOAD DOCUMENT =====
function uploadDocument() {
  openFileDialog()
    .then((filePath) => {
      if (filePath) {
        window.electronAPI
          .uploadDocumentToTask(currentProjectId, currentTaskId, filePath)
          .then(() => {
            alert("Document uploaded successfully.");
          })
          .catch((error) => {
            console.error("Error uploading document:", error);
            alert("Failed to upload document.");
          });
      }
    })
    .catch((error) => {
      console.error("Error selecting file:", error);
    });
}

const uploadDocumentDiv = document.getElementById("uploadDocument");
const uploadButton = createButton("UPLOAD DOCUMENT", uploadDocument, "medium");
uploadDocumentDiv.appendChild(uploadButton);

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
document.addEventListener("DOMContentLoaded", () => {
  renderTaskDetails();
});
