// src/backend/main.js

const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");

let mainWindow;

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

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "..", "frontend", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the main index.html page
  mainWindow.loadFile(path.join(__dirname, "..", "frontend", "pages", "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Register global shortcuts and create the window when the app is ready
app.whenReady().then(async () => {
  await ensureUploadsDir(); // Ensure uploads directory is ready
  createWindow();

  // Register CommandOrControl+R to reload the main window
  globalShortcut.register("CommandOrControl+R", () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Unregister all shortcuts and quit the app when all windows are closed
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ===== IPC Handlers =====

// Navigation Handlers
ipcMain.on("navigate-to-main", () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, "..", "frontend", "pages", "index.html"));
  }
});

ipcMain.on("navigate-to-proyekpage", (event, projectId) => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, "..", "frontend", "pages", "proyekpage.html"));
    // It's assumed that proyekpage.html will handle fetching projectId from URL or renderer
  }
});

ipcMain.on("navigate-to-tugaspage", (event, projectId, taskId) => {
  if (mainWindow) {
    const tugasPagePath = path.join(__dirname, "..", "frontend", "pages", "tugaspage.html");
    mainWindow.loadFile(tugasPagePath).then(() => {
      // Optionally, communicate the projectId and taskId to the renderer
      mainWindow.webContents.send("load-tugaspage", { projectId, taskId });
    });
  }
});

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
ipcMain.handle("update-task-status", async (event, { projectId, taskId, newStatus }) => {
  try {
    const data = await loadData(); // Function to load data.json

    const project = data.projects.find((p) => p.id === projectId);
    if (!project) {
      return { success: false, message: "Project not found." };
    }

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) {
      return { success: false, message: "Task not found." };
    }

    if (![0, 1, 2].includes(newStatus)) {
      return { success: false, message: "Invalid status value." };
    }

    task.complete = newStatus;

    await saveData(data); // Function to save data.json

    return { success: true };
  } catch (error) {
    console.error("Error updating task status:", error);
    return { success: false, message: "Failed to update task status." };
  }
});

// Delete Task
ipcMain.handle("delete-task", async (event, { projectId, taskId }) => {
  const data = await loadData();
  const project = data.projects.find((p) => p.id === projectId);
  if (project) {
    const taskIndex = project.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      const [deletedTask] = project.tasks.splice(taskIndex, 1);

      // Optionally, delete the uploaded document if exists
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
    }
  }
  return { success: false, message: "Project or Task not found." };
});

// Download doc
ipcMain.handle("download-document", async (event, relativeFilePath) => {
  try {
    // Resolve the absolute path of the file
    const absolutePath = path.join(__dirname, relativeFilePath);

    // Check if the file exists
    await fs.access(absolutePath);

    // Show save dialog to choose download location
    const { canceled, filePath: savePath } = await dialog.showSaveDialog({
      title: "Save Document",
      defaultPath: path.basename(absolutePath),
    });

    if (canceled || !savePath) {
      return { success: false, message: "Save dialog was canceled." };
    }

    // Copy the file to the chosen location
    await fs.copyFile(absolutePath, savePath);
    return { success: true };
  } catch (error) {
    console.error("Error downloading document:", error);
    return { success: false, message: "Failed to download document." };
  }
});

// ===== IPC Handler for Deleting Document =====
ipcMain.handle("delete-document", async (event, { projectId, taskId }) => {
  try {
    const data = await loadData(); // Load existing data

    const project = data.projects.find((p) => p.id === projectId);
    if (!project) {
      return { success: false, message: "Project not found." };
    }

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) {
      return { success: false, message: "Task not found." };
    }

    if (!task.documentSrc) {
      return { success: false, message: "No document to delete." };
    }

    const absoluteDocPath = path.join(__dirname, task.documentSrc);

    // Check if the file exists
    await fs.access(absoluteDocPath);

    // Delete the file
    await fs.unlink(absoluteDocPath);
    console.log(`Deleted document at ${absoluteDocPath}`);

    // Remove the documentSrc from the task
    delete task.documentSrc;

    // Save the updated data
    await saveData(data);

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, message: "Failed to delete document." };
  }
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

ipcMain.handle("delete-comment-from-task", async (event, projectId, taskId, commentIndex) => {
  try {
    const data = await loadData(); // Use loadData instead of getProjectData

    const project = data.projects.find((proj) => proj.id === projectId);
    if (!project) {
      throw new Error("Project not found.");
    }

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error("Task not found.");
    }

    if (!Array.isArray(task.comments)) {
      throw new Error("Comments data structure is invalid.");
    }

    if (commentIndex < 0 || commentIndex >= task.comments.length) {
      throw new Error("Invalid comment index.");
    }

    // Remove the comment
    task.comments.splice(commentIndex, 1);

    // Save the updated data
    await saveData(data); // Use saveData instead of saveProjectData

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, message: error.message };
  }
});
