// src/frontend/scripts/tugaspage.js

import { createButton, createLightButton, createDeleteButton, createDropdown } from "../components/buttonComponent.js";

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
  const projectId = parseInt(params.get("projectId"), 10);
  const taskId = parseInt(params.get("taskId"), 10);

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

// ===== ADAPTED displayHeader FUNCTION =====
function displayHeader(task) {
  const header = document.getElementById("header");

  // Clear any existing content to prevent duplication
  header.innerHTML = "";

  // ===== Header Container =====
  const headerContainer = document.createElement("div");
  headerContainer.classList.add("header");

  // ===== Inline Row: Deadline, Priority, Progress, Back Button =====
  const row = document.createElement("div");
  row.classList.add("row");

  // ----- Deadline ----- //
  const deadline = document.createElement("div");
  deadline.classList.add("deadline");

  const deadlineCapsule = document.createElement("span");
  deadlineCapsule.classList.add("date-capsule");
  const deadlineDate = new Date(`${task.deadlineDate}T${task.deadlineTime}`);
  deadlineCapsule.textContent = `${deadlineDate.toLocaleDateString()} ${deadlineDate.toLocaleTimeString()}`;

  deadline.appendChild(deadlineCapsule);

  // ----- Priority Dropdown ----- //
  const priorityDropdown = document.createElement("div");
  priorityDropdown.classList.add("priorityDropdown");

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

  // ----- Progress Dropdown ----- //
  const progressDropdown = document.createElement("div");
  progressDropdown.classList.add("progressDropdown");

  const statuses = [
    { label: "Not Started", value: 0 },
    { label: "On Progress", value: 1 },
    { label: "Finished", value: 2 },
  ];
  const statusSelect = createDropdownWithValues("statusSelect", statuses, task.complete);
  statusSelect.addEventListener("change", (e) => {
    const newStatus = parseInt(e.target.value, 10);
    updateTaskStatus(newStatus);
  });
  progressDropdown.appendChild(statusSelect);

  // ----- Back Button ("X") ----- //
  const backButtonDiv = document.createElement("div");
  backButtonDiv.classList.add("backButton");

  const backButton = createButton("X", navigateBackToProjectPage, "small");
  backButtonDiv.appendChild(backButton);

  // Append Deadline, Priority, Progress, and Back Button to Row
  row.appendChild(deadline);
  row.appendChild(priorityDropdown);
  row.appendChild(progressDropdown);
  row.appendChild(backButtonDiv);

  // ===== Title =====
  const titleContainer = document.createElement("div");
  titleContainer.classList.add("title");

  const title = document.createElement("h1");
  title.textContent = task.title;
  titleContainer.appendChild(title);

  // ===== Description =====
  const descriptionContainer = document.createElement("div");
  descriptionContainer.classList.add("description");

  const description = document.createElement("p");
  const maxLength = 200;
  description.textContent =
    task.description.length > maxLength ? task.description.substring(0, maxLength) + "..." : task.description;
  descriptionContainer.appendChild(description);

  // Assemble Header Container
  headerContainer.appendChild(row);
  headerContainer.appendChild(titleContainer);
  headerContainer.appendChild(descriptionContainer);

  // Append Header Container to Main Header
  header.appendChild(headerContainer);
}

// ===== CREATE DROPDOWN WITH VALUES =====
function createDropdownWithValues(id, options, selectedValue) {
  const select = document.createElement("select");
  select.id = id;
  select.classList.add("dropdown");

  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    if (option.value === selectedValue) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  return select;
}

// ===== DISPLAY BODY =====
function displayBody(task) {
  const bodySection = document.getElementById("body-section");

  // Clear existing content if any
  bodySection.innerHTML = "";

  // ===== COMMENTS DISPLAY =====
  const commentsDisplay = document.createElement("div");
  commentsDisplay.classList.add("commentsDisplay");
  commentsDisplay.id = "commentsDisplay";

  if (task.comments && task.comments.length > 0) {
    task.comments.forEach((comment, index) => {
      const commentDiv = document.createElement("div");
      commentDiv.classList.add("commentContainer");

      const commentText = document.createElement("span");
      commentText.classList.add("commentText");
      commentText.textContent = `${index + 1}. ${comment}`;

      const deleteCommentButton = createDeleteButton("Delete", () => deleteComment(index), "small");
      deleteCommentButton.classList.add("deleteCommentButton");

      commentDiv.appendChild(commentText);
      commentDiv.appendChild(deleteCommentButton);

      commentsDisplay.appendChild(commentDiv);
    });
  } else {
    const noComments = document.createElement("p");
    noComments.textContent = "No comments yet.";
    commentsDisplay.appendChild(noComments);
  }

  bodySection.appendChild(commentsDisplay);

  // ===== ADD COMMENT =====
  const insertComment = document.createElement("div");
  insertComment.classList.add("insertComment");

  const textarea = document.createElement("textarea");
  textarea.id = "newComment";
  textarea.placeholder = "Add a comment...";
  insertComment.appendChild(textarea);

  bodySection.appendChild(insertComment);

  const addCommentButton = createButton(
    "Add Comment",
    () => {
      const newCommentInput = document.getElementById("newComment");
      const newComment = newCommentInput.value.trim();
      if (newComment === "") {
        alert("Please enter a comment.");
        return;
      }
      addComment(newComment);
      newCommentInput.value = "";
    },
    "small"
  );

  const addCommentButtonContainer = document.createElement("div");
  addCommentButtonContainer.classList.add("addCommentButton");
  addCommentButtonContainer.appendChild(addCommentButton);

  bodySection.appendChild(addCommentButtonContainer);
}

// ===== DISPLAY FOOTER =====
function displayFooter(task) {
  const footer = document.getElementById("footer");

  // Clear any existing content
  footer.innerHTML = "";

  const footerRow = document.createElement("div");
  footerRow.classList.add("row", "footerRow");

  // ===== DELETE TASK BUTTON =====
  const deleteTugasDiv = document.createElement("div");
  deleteTugasDiv.classList.add("deleteTugas");

  const deleteButton = createLightButton("DELETE TASK", deleteTask, "small");
  // deleteButton.classList.add("deleteCommentButton");
  deleteTugasDiv.appendChild(deleteButton);

  // ===== DOCUMENT BUTTON =====
  const documentDiv = document.createElement("div");
  documentDiv.classList.add("documentDiv");

  let documentButton;
  if (task.documentSrc) {
    // If document is uploaded, show "DELETE DOCUMENT" button
    documentButton = createLightButton("DELETE DOCUMENT", () => deleteDocument(task.documentSrc), "small");
    // documentButton.classList.add("deleteCommentButton");
  } else {
    // If no document, show "ADD DOCUMENT" button
    documentButton = createLightButton("ADD DOCUMENT", uploadDocument, "small");
    documentButton.classList.add("addDocumentButton");
  }

  documentDiv.appendChild(documentButton);

  // ===== UPLOADED DOCUMENT DISPLAY =====
  const uploadedDocumentDiv = document.createElement("div");
  uploadedDocumentDiv.classList.add("uploadedDocument");

  if (task.documentSrc) {
    const uploadedFileLink = document.createElement("a");
    uploadedFileLink.href = "#";

    // Extract the filename using JavaScript string methods
    const fileName = task.documentSrc.split("/").pop();
    uploadedFileLink.textContent = fileName;
    uploadedFileLink.style.color = "black"; // Black font

    uploadedFileLink.addEventListener("click", () => downloadDocument(task.documentSrc));

    uploadedDocumentDiv.appendChild(uploadedFileLink);
  }

  // ===== APPEND TO FOOTER ROW =====
  footerRow.appendChild(deleteTugasDiv);
  footerRow.appendChild(documentDiv);
  footerRow.appendChild(uploadedDocumentDiv);

  footer.appendChild(footerRow);
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

// ===== DELETE COMMENT =====
async function deleteComment(commentIndex) {
  const confirmDelete = confirm("Are you sure you want to delete this comment?");
  if (!confirmDelete) return;

  try {
    const response = await window.electronAPI.deleteCommentFromTask(currentProjectId, currentTaskId, commentIndex);

    if (response.success) {
      alert("Comment deleted successfully.");
      const data = await window.electronAPI.getProjectData();
      const project = data.projects.find((proj) => proj.id === currentProjectId);
      const task = project.tasks.find((t) => t.id === currentTaskId);
      updateCommentsDisplay(task);
    } else {
      alert(response.message || "Failed to delete comment.");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("Failed to delete comment.");
  }
}

// ===== DOWNLOAD DOCUMENT =====
async function downloadDocument(documentSrc) {
  try {
    const response = await window.electronAPI.downloadDocument(documentSrc);

    if (response.success) {
      alert("Document downloaded successfully.");
    } else {
      alert(response.message || "Failed to download document.");
    }
  } catch (error) {
    console.error("Error downloading document:", error);
    alert("Failed to download document.");
  }
}

// ===== DELETE DOCUMENT =====
async function deleteDocument(documentSrc) {
  const confirmDelete = confirm("Are you sure you want to delete this document?");
  if (!confirmDelete) return;

  try {
    const response = await window.electronAPI.deleteDocument(currentProjectId, currentTaskId);

    if (response.success) {
      alert("Document deleted successfully.");
      // Refresh the footer to show "ADD DOCUMENT" button
      const data = await window.electronAPI.getProjectData();
      const project = data.projects.find((proj) => proj.id === currentProjectId);
      const task = project.tasks.find((t) => t.id === currentTaskId);
      displayFooter(task);
    } else {
      alert(response.message || "Failed to delete document.");
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    alert("Failed to delete document.");
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
        // Update the UI to reflect the uploaded document
        const data = await window.electronAPI.getProjectData();
        const project = data.projects.find((proj) => proj.id === currentProjectId);
        const task = project.tasks.find((t) => t.id === currentTaskId);
        displayFooter(task);
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

// ===== UPDATE COMMENTS DISPLAY =====
function updateCommentsDisplay(task) {
  const commentsDisplay = document.getElementById("commentsDisplay");
  commentsDisplay.innerHTML = ""; // Clear existing comments

  if (task.comments && task.comments.length > 0) {
    task.comments.forEach((comment, index) => {
      const commentDiv = document.createElement("div");
      commentDiv.classList.add("commentContainer");

      const commentText = document.createElement("span");
      commentText.classList.add("commentText");
      commentText.textContent = `${index + 1}. ${comment}`;

      const deleteCommentButton = createDeleteButton("Delete", () => deleteComment(index), "small");
      deleteCommentButton.classList.add("deleteCommentButton");

      commentDiv.appendChild(commentText);
      commentDiv.appendChild(deleteCommentButton);

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
    } else {
      console.log("Priority updated successfully.");
    }
  } catch (error) {
    console.error("Error updating priority:", error);
  }
}

// ===== UPDATE TASK STATUS =====
async function updateTaskStatus(newStatus) {
  try {
    const response = await window.electronAPI.updateTaskStatus(currentProjectId, currentTaskId, newStatus);

    if (!response.success) {
      alert(response.message || "Failed to update status.");
    } else {
      console.log("Status updated successfully.");
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

// ===== DISPLAY ERROR MESSAGE =====
function displayErrorMessage(message) {
  const header = document.getElementById("header");
  header.innerHTML = "";

  const errorMsg = document.createElement("p");
  errorMsg.textContent = message;
  errorMsg.style.color = "red";
  errorMsg.style.fontSize = "18px";
  errorMsg.style.textAlign = "center";
  errorMsg.style.marginTop = "20px";

  header.appendChild(errorMsg);
}

// ===== INITIALIZE =====
document.addEventListener("DOMContentLoaded", () => {
  renderTaskDetails();
});
