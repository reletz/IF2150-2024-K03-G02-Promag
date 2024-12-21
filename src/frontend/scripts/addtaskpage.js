import { createButton, createDeleteButton } from "../components/buttonComponent.js";

// Function to navigate to the project page
function navigateToProyekPage(projectId) {
  window.location.href = `proyekpage.html?id=${projectId}`;
}

// Function to navigate back to the project page with validation
async function navigateBackToProjectPage() {
  if (!isNaN(projectId)) {
    window.location.href = `proyekpage.html?id=${projectId}`;
  } else {
    console.error("Current Project ID is not set or invalid.");
    await window.electronAPI.showMessageBox({
      type: "error",
      title: "Navigation Error",
      message: "Cannot navigate back. Project ID is missing or invalid.",
    });
  }
}

// Select the section for the new task form
const formSection = document.querySelector("#new-task-form");
const params = new URLSearchParams(window.location.search);
const projectId = parseInt(params.get("projectId"), 10);

// Ensure form section exists
if (!formSection) {
  console.error("Element with ID 'new-task-form' not found in the DOM.");
  window.electronAPI.showMessageBox({
    type: "error",
    title: "Form Error",
    message: "Missing #new-task-form element.",
  });
  throw new Error("Missing #new-task-form element.");
}

// Create the form element
const form = document.createElement("form");
form.id = "task-form";

// Create the title input field
const titleLabel = document.createElement("label");
titleLabel.htmlFor = "task-title";
titleLabel.textContent = "Title";

const titleInput = document.createElement("input");
titleInput.type = "text";
titleInput.id = "task-title";
titleInput.name = "title";
titleInput.placeholder = "Enter task title";
titleInput.required = true;

// Create the description input field
const descriptionLabel = document.createElement("label");
descriptionLabel.htmlFor = "task-description";
descriptionLabel.textContent = "Description";

const descriptionInput = document.createElement("textarea");
descriptionInput.id = "task-description";
descriptionInput.name = "description";
descriptionInput.placeholder = "Enter task description";
descriptionInput.rows = 5;
descriptionInput.required = true;

// Create the priority dropdown
const priorityLabel = document.createElement("label");
priorityLabel.htmlFor = "task-priority";
priorityLabel.textContent = "Priority";

const prioritySelect = document.createElement("select");
prioritySelect.id = "task-priority";
prioritySelect.name = "priority";

const priorities = ["High", "Medium", "Low"];
priorities.forEach((priority) => {
  const option = document.createElement("option");
  option.value = priority.toLowerCase();
  option.textContent = priority;
  prioritySelect.appendChild(option);
});

// Create the deadline input field
const deadlineLabel = document.createElement("label");
deadlineLabel.htmlFor = "task-deadline";
deadlineLabel.textContent = "Deadline (Date)";

const deadlineInput = document.createElement("input");
deadlineInput.type = "date";
deadlineInput.id = "task-deadline";
deadlineInput.name = "deadline";
deadlineInput.required = true;

// Create the deadline time input field
const deadlineTimeLabel = document.createElement("label");
deadlineTimeLabel.htmlFor = "task-deadline-time";
deadlineTimeLabel.textContent = "Deadline (Time)";

const deadlineTimeInput = document.createElement("input");
deadlineTimeInput.type = "time";
deadlineTimeInput.id = "task-deadline-time";
deadlineTimeInput.name = "deadlineTime";
deadlineTimeInput.required = true;

// Add the form elements to the form
form.appendChild(titleLabel);
form.appendChild(titleInput);
form.appendChild(descriptionLabel);
form.appendChild(descriptionInput);
form.appendChild(priorityLabel);
form.appendChild(prioritySelect);
form.appendChild(deadlineLabel);
form.appendChild(deadlineInput);
form.appendChild(deadlineTimeLabel);
form.appendChild(deadlineTimeInput);

// Add the form to the form section
formSection.appendChild(form);

// Create the submit button with automatic navigation upon success
const submitButton = createButton(
  "Add Task",
  async () => {
    console.log("Add Task button clicked"); // Log button click

    // Validate the form before proceeding
    if (!form.checkValidity()) {
      await window.electronAPI.showMessageBox({
        type: "warning",
        title: "Incomplete Fields",
        message: "Please fill in all required fields before adding the task.",
      });
      form.reportValidity(); // Show validation messages
      return;
    }

    const date = deadlineInput.value;
    let time = deadlineTimeInput.value || "23:59:59";

    if (time.length === 5) {
      time += ":00"; // Ensure time is in "HH:MM:SS" format
    }

    try {
      const taskId = await newTaskId(projectId);
      console.log("Generated Task ID:", taskId); // Log generated taskId

      const task = {
        id: taskId,
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        priority: prioritySelect.value,
        comments: [],
        documentSrc: "",
        complete: 0,
        deadlineDate: date,
        deadlineTime: time,
      };

      const result = await window.electronAPI.addTask(projectId, task);

      if (result.success) {
        await window.electronAPI.showMessageBox({
          type: "info",
          title: "Success",
          message: "Task added successfully.",
        });
        navigateBackToProjectPage(); // Automatically navigate without alert
      } else {
        console.error("Failed to add task:", result.error);
        await window.electronAPI.showMessageBox({
          type: "error",
          title: "Error",
          message: `Failed to add task: ${result.error}`,
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      await window.electronAPI.showMessageBox({
        type: "error",
        title: "Error",
        message: "An error occurred while adding the task.",
      });
    }
  },
  "small"
);
submitButton.type = "button"; // Ensure it's a button, not a submit
// Ensure the button is enabled by default
// submitButton.disabled = true; // Remove or comment out this line if present

const backButton = createButton("Batal", () => navigateToProyekPage(projectId), "small");
backButton.classList.add("deleteCommentButton");

const buttonContainer = document.createElement("div");
buttonContainer.style.display = "flex";
buttonContainer.style.justifyContent = "space-between";

// Append buttons to the container
buttonContainer.appendChild(submitButton);
buttonContainer.appendChild(backButton);

// Add the container to the form
form.appendChild(buttonContainer);

// Function to generate a new task ID
async function newTaskId(projectId) {
  try {
    const data = await window.electronAPI.getProjectData();
    const project = data.projects.find((proj) => proj.id === projectId);

    if (!project) {
      console.error(`Project with ID "${projectId}" not found.`);
      await window.electronAPI.showMessageBox({
        type: "error",
        title: "Project Not Found",
        message: `Project with ID "${projectId}" not found.`,
      });
      throw new Error(`Project with ID "${projectId}" not found.`);
    }

    const maxId = project.tasks.reduce((max, task) => (task.id > max ? task.id : max), 0);
    return maxId + 1;
  } catch (error) {
    console.error("Error fetching project data for new task ID:", error);
    await window.electronAPI.showMessageBox({
      type: "error",
      title: "ID Generation Error",
      message: "An error occurred while generating a new Task ID.",
    });
    return 1; // Default ID if there's an error
  }
}
