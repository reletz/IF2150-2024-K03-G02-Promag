// src/frontend/preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  navigateToTugasPage: () => ipcRenderer.send("navigate-to-tugaspage"),
  navigateToProyekPage: () => ipcRenderer.send("navigate-to-proyekpage"),
  navigateToMainPage: () => ipcRenderer.send("navigate-to-main"),
  navigateToCreateTugasPage: () => ipcRenderer.send("navigate-to-create-tugaspage"),
  getProjectData: () => ipcRenderer.invoke("get-project-data"),

  addProject: (newProject) => ipcRenderer.invoke('add-project', newProject),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
  editProject: (updatedProject) => ipcRenderer.invoke('edit-project', updatedProject),

  addTask: (projectId, newTask) => ipcRenderer.invoke("add-task", { projectId, newTask }),
  deleteTask: (projectId, taskId) => ipcRenderer.invoke('delete-task', { projectId, taskId }),
  addCommentToTask: (projectId, taskId, comment) => ipcRenderer.invoke('add-comment', { projectId, taskId, comment }),
  updateTaskPriority: (projectId, taskId, priority) => ipcRenderer.invoke('update-task-priority', { projectId, taskId, priority }),
  updateTaskStatus: (projectId, taskId, isComplete) => ipcRenderer.invoke('update-task-status', { projectId, taskId, isComplete }),
  uploadDocumentToTask: (projectId, taskId, filePath) => ipcRenderer.invoke('upload-document', { projectId, taskId, filePath }),
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  deleteCommentFromTask: (projectId, taskId, commentIndex) =>
    ipcRenderer.invoke("delete-comment-from-task", projectId, taskId, commentIndex),
  downloadDocument: (documentSrc) => ipcRenderer.invoke("download-document", documentSrc),
  deleteDocument: (projectId, taskId) => ipcRenderer.invoke("delete-document", { projectId, taskId }),
  
  updateProjectComplete: (projectId) => ipcRenderer.invoke("update-project-complete", projectId),
  updateProjectEndDate: (projectId, endDate, endTime) =>
    ipcRenderer.invoke("update-project-end-date", { projectId, endDate, endTime }),
});
