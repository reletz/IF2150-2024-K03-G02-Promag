// src/backend/main.js

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs").promises;

// Define paths
const dataPath = path.join(__dirname, "data.json");
const uploadsDir = path.join(__dirname, "uploads");

// Ensure the uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.access(uploadsDir);
    // Directory exists
  } catch (error) {
    // Directory does not exist, create it
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at ${uploadsDir}`);
  }
}

// Load project data from JSON file
async function loadData() {
  try {
    const data = await fs.readFile(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data.json:", error);
    return { projects: [] }; // Return empty structure on error
  }
}

// Save project data to JSON file
async function saveData(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(dataPath, jsonData, "utf8");
    console.log("Data saved successfully.");
  } catch (error) {
    console.error("Error writing to data.json:", error);
  }
}

// Dialog Handler
ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
  });
  return result;
});

// Get Project Data Handler
ipcMain.handle("get-project-data", async () => {
  const data = await loadData();
  return data;
});

// Add Comment to Task
ipcMain.handle("add-comment", async (event, { projectId, taskId, comment }) => {
  const data = await loadData();
  const project = data.projects.find((p) => p.id === projectId);
  if (project) {
    const task = project.tasks.find((t) => t.id === taskId);
    if (task) {
      if (!Array.isArray(task.comments)) {
        task.comments = [];
      }
      task.comments.push(comment);
      await saveData(data);
      return { success: true };
    }
  }
  return { success: false, message: "Project or Task not found." };
});

// Update Task Priority
ipcMain.handle("update-task-priority", async (event, { projectId, taskId, priority }) => {
  const validPriorities = ["high", "medium", "low"];
  if (!validPriorities.includes(priority.toLowerCase())) {
    return { success: false, message: "Invalid priority value." };
  }

  const data = await loadData();
  const project = data.projects.find((p) => p.id === projectId);
  if (project) {
    const task = project.tasks.find((t) => t.id === taskId);
    if (task) {
      task.priority = priority.toLowerCase();
      await saveData(data);
      return { success: true };
    }
  }
  return { success: false, message: "Project or Task not found." };
});

// Update Task Status
ipcMain.handle("update-task-status", async (event, { projectId, taskId, isComplete }) => {
  if (typeof isComplete !== "boolean") {
    return { success: false, message: "Invalid status value." };
  }

  const data = await loadData();
  const project = data.projects.find((p) => p.id === projectId);
  if (project) {
    const task = project.tasks.find((t) => t.id === taskId);
    if (task) {
      task.complete = isComplete;
      await saveData(data);
      return { success: true };
    }
  }
  return { success: false, message: "Project or Task not found." };
});

// Add Task
ipcMain.handle("add-task", async (event, projectId, task) => {
  const data = await loadData();
  const project = data.projects.find((p) => p.id === projectId);
  if (project) {
    project.tasks.push(task);
    await saveData(data);
    return { success: true };
  }
  return { success: false, message: "Project not found." };
});

// Delete Task
ipcMain.handle("delete-task", async (event, { projectId, taskId }) => {
  console.log("Received IDs:", { projectId, taskId }); // Debug IDs
  const data = await loadData();
  console.log("Current Data:", JSON.stringify(data, null, 2)); // Debug data

  const project = data.projects.find((p) => p.id === projectId);
  if (!project) {
    console.error(`Project with ID ${projectId} not found.`);
    return { success: false, message: "Project not found." };
  }

  const taskIndex = project.tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task with ID ${taskId} not found in project ${projectId}.`);
    return { success: false, message: "Task not found." };
  }

  const [deletedTask] = project.tasks.splice(taskIndex, 1);
  console.log("Deleted Task:", deletedTask); // Debug deleted task

  // Handle document deletion
  if (deletedTask.documentSrc) {
    const docPath = path.join(uploadsDir, path.basename(deletedTask.documentSrc));
    try {
      await fs.unlink(docPath);
      console.log(`Deleted document at ${docPath}`);
    } catch (err) {
      console.error(`Error deleting document at ${docPath}:`, err);
    }
  }

  await saveData(data);
  return { success: true };
});

// Upload Document to Task
ipcMain.handle("upload-document", async (event, { projectId, taskId, filePath }) => {
  try {
    const data = await loadData();
    const project = data.projects.find((p) => p.id === projectId);
    if (!project) {
      return { success: false, message: "Project not found." };
    }

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) {
      return { success: false, message: "Task not found." };
    }

    // Ensure the uploads directory exists
    await ensureUploadsDir();

    // Generate a unique filename to prevent overwriting
    const fileName = `${Date.now()}_${path.basename(filePath)}`;
    const destinationPath = path.join(uploadsDir, fileName);

    // Copy the file to the uploads directory
    await fs.copyFile(filePath, destinationPath);
    console.log(`Uploaded file from ${filePath} to ${destinationPath}`);

    // Update the task's documentSrc with the relative path
    task.documentSrc = path.relative(__dirname, destinationPath);
    await saveData(data);

    return { success: true, documentSrc: task.documentSrc };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { success: false, message: "Failed to upload document." };
  }
});

ipcMain.handle("add-project", async (event, project) => {
  const data = await loadData();
  data.projects.push(project);
  await saveData(data);
  return { success: true };
});

ipcMain.handle("edit-project", async (event, project) => {
  const data = await loadData();
  const index = data.projects.findIndex((p) => p.id === project.id);
  if (index !== -1) {
    data.projects[index] = project;
    await saveData(data);
    return { success: true };
  }
  return { success: false, message: "Project not found." };
});

ipcMain.handle("delete-project", async (event, projectId) => {
  const data = await loadData();
  const index = data.projects.findIndex((p) => p.id === projectId);
  if (index !== -1) {
    data.projects.splice(index, 1);
    await saveData(data);
    return { success: true };
  }
  return { success: false, message: "Project not found." };
});

module.exports = {
  loadData,
  saveData,
  ensureUploadsDir,
};