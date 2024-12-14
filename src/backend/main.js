const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

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

  mainWindow.loadFile(path.join(__dirname, "..", "frontend", "pages", "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("CommandOrControl+R", () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });
});

app.on("will-quit", () => {
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
    mainWindow.loadFile(path.join(__dirname, "..", "frontend", "pages", "index.html"));
  }
});

ipcMain.on("navigate-to-proyekpage", () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, "..", "frontend", "pages", "proyekpage.html"));
  }
});

ipcMain.on("navigate-to-tugaspage", () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, "..", "frontend", "pages", "tugaspage.html"));
  }
});

// IPC handler to get project data
ipcMain.handle("get-project-data", async () => {
  const dataPath = path.join(__dirname, "data.json");
  const data = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(data);
});
