const { ipcMain, app } = require("electron");
const fs = require("fs");
const path = require("path");
const { Mutex } = require("async-mutex");

const filePath = path.join(__dirname, "data.json");
const maxBackups = 5;
let jsonData = null;
const saveMutex = new Mutex();

let isDataChanged = false;

// Initialize Cache
function initializeJSONCache() {
  try {
    if (fs.existsSync(filePath)) {
      jsonData = readJSONFile();
      console.log("JSON cache initialized:", jsonData); // Log isi cache
    } else {
      jsonData = { projects: [] };
      saveJSONCache();
      console.log("File data.json created and cache initialized");
    }
  } catch (error) {
    console.error("Failed to initialize JSON cache:", error.message);
  }
}

// Read JSON File
function readJSONFile() {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Write JSON File
function writeJSONFile(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Save Cache to File
async function saveJSONCache() {
  const release = await saveMutex.acquire();
  try {
    if (isDataChanged) {
      writeJSONFile(jsonData);
      console.log("JSON cache saved to file");
      isDataChanged = false; // Reset flag after saving
    }
  } catch (error) {
    console.error("Failed to save JSON cache:", error);
  } finally {
    release();
  }
}

// Set Data Changed
function setDataChanged() {
  isDataChanged = true;
}

// Backup JSON File
function backupJSONFile() {
  if (!isDataChanged) return;
  const backupDir = path.dirname(filePath);
  const backupPath = filePath.replace(".json", `_backup_${Date.now()}.json`);

  fs.copyFileSync(filePath, backupPath);
  console.log(`Backup created: ${backupPath}`);

  // Rotasi backup
  const backups = fs
    .readdirSync(backupDir)
    .filter((file) => file.includes("_backup_"))
    .map((file) => ({
      file,
      time: fs.statSync(path.join(backupDir, file)).ctime.getTime(),
    }))
    .sort((a, b) => a.time - b.time);

  while (backups.length > maxBackups) {
    const oldestBackup = backups.shift();
    fs.unlinkSync(path.join(backupDir, oldestBackup.file));
    console.log(`Deleted old backup: ${oldestBackup.file}`);
  }
}

// Auto-backup JSON File every 5 seconds
setInterval(() => {
  saveJSONCache();
}, 5000);

// CRUD Operations Using Cache
function addProject(newProject) {
  if (!jsonData) throw new Error("JSON data not initialized");
  jsonData.projects.push(newProject);
  setDataChanged();
  saveJSONCache();
}

function deleteProject(projectId) {
  if (!jsonData) throw new Error("JSON data not initialized");
  const projectIndex = jsonData.projects.findIndex((project) => project.id === projectId);
  if (projectIndex === -1) throw new Error(`Project with ID ${projectId} not found`);
  jsonData.projects.splice(projectIndex, 1);
  setDataChanged();
  saveJSONCache();
}

function addTask(projectId, newTask) {
  if (!jsonData) throw new Error("JSON data not initialized");
  const project = jsonData.projects.find((project) => project.id === projectId);
  if (!project) throw new Error(`Project with ID ${projectId} not found`);
  project.tasks.push(newTask);
  setDataChanged();
  saveJSONCache();
}

function deleteTask(projectId, taskId) {
  if (!jsonData) throw new Error("JSON data not initialized");
  const project = jsonData.projects.find((project) => project.id === projectId);
  if (!project) throw new Error(`Project with ID ${projectId} not found`);
  const taskIndex = project.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) throw new Error(`Task with ID ${taskId} not found`);
  project.tasks.splice(taskIndex, 1);
  setDataChanged();
  saveJSONCache();
}

// IPC Handlers
ipcMain.handle("add-project", (event, newProject) => {
  try {
    addProject(newProject);
    return { success: true };
  } catch (error) {
    console.error(`Error in add-project: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("delete-project", (event, projectId) => {
  try {
    deleteProject(projectId);
    return { success: true };
  } catch (error) {
    console.error(`Error in delete-project: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("add-task", (event, projectId, newTask) => {
  try {
    addTask(projectId, newTask);
    return { success: true };
  } catch (error) {
    console.error(`Error in add-task: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("delete-task", (event, projectId, taskId) => {
  try {
    deleteTask(projectId, taskId);
    return { success: true };
  } catch (error) {
    console.error(`Error in delete-task: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("read-json-cache", () => {
  try {
    return jsonData;
  } catch (error) {
    console.error(`Error in read-json-cache: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-project-data", async () => {
  try {
    console.log("Handler 'get-project-data' called"); // Log pemanggilan handler
    const dataPath = path.join(__dirname, "data.json");
    const data = fs.readFileSync(dataPath, "utf8");
    const parsedData = JSON.parse(data);
    console.log("Data successfully loaded:", parsedData); // Log data yang berhasil diambil
    return parsedData;
  } catch (error) {
    console.error("Error in 'get-project-data' handler:", error.message);
    return { projects: [] }; // Return kosong jika error
  }
});

// Initialize Cache on Startup
initializeJSONCache();

// Export
module.exports = {
  jsonData,
  initializeJSONCache,
  readJSONFile,
  writeJSONFile,
  saveJSONCache,
  setDataChanged,
  backupJSONFile,
  addProject,
  deleteProject,
  addTask,
  deleteTask,
};
