// src/frontend/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
  navigateToTugasPage: () => ipcRenderer.send("navigate-to-tugaspage"),
  navigateToProyekPage: () => ipcRenderer.send("navigate-to-proyekpage"),
  navigateToMainPage: () => ipcRenderer.send("navigate-to-main"),
  getProjectData: () => ipcRenderer.invoke("get-project-data"),
  addProject: (newProject) => ipcRenderer.invoke('add-project', newProject),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
  addTask: (projectId, newTask) => ipcRenderer.invoke('add-task', projectId, newTask),
  deleteTask: (projectId, taskId) => ipcRenderer.invoke('delete-task', projectId, taskId),
  writeJSONFile: (data) => ipcRenderer.invoke('write-json-file', data),
  readJSONFile: () => ipcRenderer.invoke('read-json-file'),
});
