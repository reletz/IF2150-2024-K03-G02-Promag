// src/backend/main.js

const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const {
  initializeJSONCache,
  saveJSONCache,
  addProject,
  deleteProject,
} = require('./handler');

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

// IPC handler to get project data
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  saveJSONCache(); // Simpan cache sebelum crash
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  saveJSONCache(); // Simpan cache sebelum crash
  process.exit(1);
});

app.on('before-quit', () => {
  saveJSONCache();
  console.log('JSON cache saved before app quit');
});
