// src/frontend/components/taskComponent.js

/**
 * Creates a task detail element.
 * @param {Object} task - The task data.
 * @returns {HTMLElement} - The task detail element.
 */
export function createTaskDetail(task) {
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("task-detail");

  const title = document.createElement("h2");
  title.textContent = task.title;
  taskDiv.appendChild(title);

  // Add more task details as needed

  return taskDiv;
}
