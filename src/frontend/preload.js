// preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  navigateToTugasPage: () => ipcRenderer.send("navigate-to-tugaspage"),
  navigateToProyekPage: () => ipcRenderer.send("navigate-to-proyekpage"),
  navigateToMainPage: () => ipcRenderer.send("navigate-to-main"),
  getProjectData: () => ipcRenderer.invoke("get-project-data"),
});
