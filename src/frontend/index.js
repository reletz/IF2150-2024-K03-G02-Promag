const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");

// Enable electron-reload for hot reloading
require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
  hardResetMethod: "exit",
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  // Register a global shortcut to reload the window
  globalShortcut.register("CommandOrControl+R", () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });
});

app.on("will-quit", () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// Handle IPC messages for navigation
ipcMain.on("navigate-to-tugaspage", () => {
  mainWindow.loadFile("tugaspage.html");
});

ipcMain.on("navigate-to-proyekpage", () => {
  mainWindow.loadFile("proyekpage.html");
});

ipcMain.on("navigate-to-main", () => {
  mainWindow.loadFile("index.html");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
