// src/backend/main.js
const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require("electron");
const { createWindow, ensureUploadsDir, mainWindow } = require('./handler');
const path = require("path");

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
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.on('before-quit', () => {
  console.log('Saved before app quit');
});