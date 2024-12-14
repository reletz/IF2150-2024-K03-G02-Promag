// src/frontend/preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  navigateToMainPage: () => ipcRenderer.send("navigate-to-main"),
  navigateToProyekPage: (projectId) => ipcRenderer.send("navigate-to-proyekpage", projectId),
  navigateToTugasPage: (projectId, taskId) => ipcRenderer.send("navigate-to-tugaspage", projectId, taskId),
  getProjectData: () => ipcRenderer.invoke("get-project-data"),
  addCommentToTask: (projectId, taskId, comment) => ipcRenderer.invoke("add-comment", { projectId, taskId, comment }),
  updateTaskPriority: (projectId, taskId, priority) =>
    ipcRenderer.invoke("update-task-priority", { projectId, taskId, priority }),
  updateTaskStatus: (projectId, taskId, newStatus) => ipcRenderer.invoke("update-task-status", { projectId, taskId, newStatus }),
  deleteTask: (projectId, taskId) => ipcRenderer.invoke("delete-task", { projectId, taskId }),
  uploadDocumentToTask: (projectId, taskId, filePath) => ipcRenderer.invoke("upload-document", { projectId, taskId, filePath }),
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  deleteCommentFromTask: (projectId, taskId, commentIndex) =>
    ipcRenderer.invoke("delete-comment-from-task", projectId, taskId, commentIndex),
  downloadDocument: (documentSrc) => ipcRenderer.invoke("download-document", documentSrc),
  deleteDocument: (projectId, taskId) => ipcRenderer.invoke("delete-document", { projectId, taskId }),
});
