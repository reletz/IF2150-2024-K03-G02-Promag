// src/backend/main.js
const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require("electron");
const { mainWindow } = require('./navhandler');

// Unregister all shortcuts and quit the app when all windows are closed
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});