// preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  navigateToTugasPage: () => ipcRenderer.send("navigate-to-tugaspage"),
  navigateToMainPage: () => ipcRenderer.send("navigate-to-main"),
});
