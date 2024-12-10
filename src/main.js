const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");

// Enable electron-reload for hot reloading
require("electron-reload")(path.join(__dirname, ".."), {
  electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
  hardResetMethod: "exit",
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "frontend", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "frontend", "pages", "index.html"));

  // Optional: Open DevTools for debugging
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
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

// Handle IPC messages for navigation
ipcMain.on("navigate-to-main", () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, "frontend", "pages", "index.html"));
  }
});

ipcMain.on("navigate-to-proyekpage", () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, "frontend", "pages", "proyekpage.html"));
  }
});

ipcMain.on("navigate-to-tugaspage", () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, "frontend", "pages", "tugaspage.html"));
  }
});
