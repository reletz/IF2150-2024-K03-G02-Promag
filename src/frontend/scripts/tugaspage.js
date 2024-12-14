// src/frontend/scripts/tugaspage.js

import { createButton, createDropdown } from "../components/buttonComponent.js";

// ===== NAVIGATION FUNCTIONS =====
function navigateBackToProjectPage() {
  if (currentProjectId !== null) {
    window.location.href = `proyekpage.html?id=${currentProjectId}`;
  } else {
    console.error("Current Project ID is not set.");
    alert("Cannot navigate back. Project ID is missing.");
  }
}

let currentProjectId = null;
let currentTaskId = null;

// ===== RENDER TASK DETAILS =====
async function renderTaskDetails() {
  const params = new URLSearchParams(window.location.search);
  const projectId = parseInt(params.get("projectId"), 10); // Changed from "id" to "projectId"
  const taskId = parseInt(params.get("taskId"), 10);

  // Debugging: Log the retrieved parameters
  console.log(`Retrieved projectId: ${projectId}, taskId: ${taskId}`);

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
  displayBody(task);
  displayFooter(task);
}

// ===== DISPLAY HEADER =====
function displayHeader(task) {
  const header = document.getElementById("header");

  const headerRow = document.createElement("div");
  headerRow.classList.add("row");

  const deadlineCapsule = document.createElement("div");
  deadlineCapsule.classList.add("deadlineCapsule");
  deadlineCapsule.id = "deadlineCapsule";

  const priorityDropdown = document.createElement("div");
  priorityDropdown.classList.add("priorityDropdown");
  priorityDropdown.id = "priorityDropdown";

  const statusDisplay = document.createElement("div");
  statusDisplay.classList.add("statusDisplay");
  statusDisplay.id = "statusDisplay";

  const tugasTitle = document.createElement("div");
  tugasTitle.classList.add("tugasTitle");
  tugasTitle.id = "tugasTitle";

  headerRow.appendChild(deadlineCapsule);
  headerRow.appendChild(priorityDropdown);
  headerRow.appendChild(statusDisplay);
  headerRow.appendChild(tugasTitle);

  header.appendChild(headerRow);

  // Task Title
  const title = document.createElement("h1");
  title.textContent = task.title;
  tugasTitle.appendChild(title);

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
  const statusSelect = createDropdown("statusSelect", statuses, task.complete ? "Finished" : "On Progress");
  statusSelect.addEventListener("change", (e) => {
    const newStatus = e.target.value;
    updateTaskStatus(newStatus);
  });
  statusDisplay.appendChild(statusSelect);
}

// ===== DISPLAY BODY =====
function displayBody(task) {
  const bodySection = document.getElementById("body-section");

  // ===== COMMENTS DISPLAY =====
  const commentsDisplay = document.createElement("div");
  commentsDisplay.classList.add("commentsDisplay");
  commentsDisplay.id = "commentsDisplay";
  bodySection.appendChild(commentsDisplay);

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

  // ===== ADD COMMENT =====
  const insertComment = document.createElement("div");
  insertComment.classList.add("insertComment");

  const textarea = document.createElement("textarea");
  textarea.id = "newComment";
  textarea.placeholder = "Add a comment...";
  insertComment.appendChild(textarea);

  bodySection.appendChild(insertComment);

  const addCommentButton = document.createElement("div");
  addCommentButton.classList.add("addCommentButton");

  const addCommentBtn = document.createElement("button");
  addCommentBtn.id = "addCommentBtn";
  addCommentBtn.classList.add("custom-button", "small");
  addCommentBtn.textContent = "Add Comment";
  addCommentButton.appendChild(addCommentBtn);

  bodySection.appendChild(addCommentButton);

  // ===== ADD COMMENT EVENT LISTENER =====
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
}

// ===== DISPLAY FOOTER =====
function displayFooter(task) {
  const footer = document.getElementById("footer");

  const footerRow = document.createElement("div");
  footerRow.classList.add("row");

  const deleteTugasDiv = document.createElement("div");
  deleteTugasDiv.classList.add("deleteTugas");
  deleteTugasDiv.id = "deleteTugas";

  const uploadDocumentDiv = document.createElement("div");
  uploadDocumentDiv.classList.add("uploadDocument");
  uploadDocumentDiv.id = "uploadDocument";

  footerRow.appendChild(deleteTugasDiv);
  footerRow.appendChild(uploadDocumentDiv);

  // Back Button Container
  const backButtonContainer = document.createElement("div");
  backButtonContainer.id = "backButtonContainer";
  footerRow.appendChild(backButtonContainer);

  footer.appendChild(footerRow);

  // ===== DELETE TASK BUTTON =====
  const deleteButton = createButton("DELETE TASK", deleteTask, "medium");
  deleteTugasDiv.appendChild(deleteButton);

  // ===== UPLOAD DOCUMENT BUTTON =====
  const uploadButton = createButton("UPLOAD DOCUMENT", uploadDocument, "medium");
  uploadDocumentDiv.appendChild(uploadButton);

  // ===== BACK TO PROJECT BUTTON =====
  const backButton = createButton("BACK TO PROJECT", navigateBackToProjectPage, "medium");
  backButtonContainer.appendChild(backButton);
}

// ===== ADD COMMENT =====
async function addComment(comment) {
  try {
    const response = await window.electronAPI.addCommentToTask(currentProjectId, currentTaskId, comment);
    if (response.success) {
      const data = await window.electronAPI.getProjectData();
      const project = data.projects.find((proj) => proj.id === currentProjectId);
      const task = project.tasks.find((t) => t.id === currentTaskId);
      updateCommentsDisplay(task);
    } else {
      alert(response.message || "Failed to add comment.");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}

// ===== UPDATE COMMENTS DISPLAY =====
function updateCommentsDisplay(task) {
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

// ===== UPDATE TASK PRIORITY =====
async function updateTaskPriority(newPriority) {
  try {
    const response = await window.electronAPI.updateTaskPriority(currentProjectId, currentTaskId, newPriority);
    if (!response.success) {
      alert(response.message || "Failed to update priority.");
    }
  } catch (error) {
    console.error("Error updating priority:", error);
  }
}

// ===== UPDATE TASK STATUS =====
async function updateTaskStatus(newStatus) {
  const isComplete = newStatus === "Finished";
  try {
    const response = await window.electronAPI.updateTaskStatus(currentProjectId, currentTaskId, isComplete);
    if (!response.success) {
      alert(response.message || "Failed to update status.");
    }
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

// ===== DELETE TASK =====
async function deleteTask() {
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  try {
    const response = await window.electronAPI.deleteTask(currentProjectId, currentTaskId);
    if (response.success) {
      alert("Task deleted successfully.");
      navigateBackToProjectPage();
    } else {
      alert(response.message || "Failed to delete task.");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    alert("Failed to delete task.");
  }
}

// ===== UPLOAD DOCUMENT =====
async function uploadDocument() {
  try {
    const result = await window.electronAPI.openFileDialog();
    if (result && result.filePaths && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const response = await window.electronAPI.uploadDocumentToTask(currentProjectId, currentTaskId, filePath);

      if (response.success) {
        alert("Document uploaded successfully.");
        // Optionally, update the UI to reflect the uploaded document
      } else {
        alert(response.message || "Failed to upload document.");
      }
    } else {
      console.log("File selection was canceled.");
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    alert("Failed to upload document.");
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
document.addEventListener("DOMContentLoaded", () => {
  // Render Task Details (Header, Body, Footer)
  renderTaskDetails();
});
