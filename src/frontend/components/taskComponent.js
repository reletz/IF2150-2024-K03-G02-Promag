// src/frontend/components/taskComponent.js

function createTaskComponent(task) {
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("task");

  const title = document.createElement("h3");
  title.textContent = task.title;
  taskDiv.appendChild(title);

  const deadline = document.createElement("p");
  deadline.textContent = `Deadline: ${new Date(task.deadline).toLocaleDateString()}`;
  taskDiv.appendChild(deadline);

  const detailsButton = document.createElement("button");
  detailsButton.textContent = "Details";
  detailsButton.addEventListener("click", () => {
    // Navigate to task details page
    window.location.href = `taskDetails.html?project=${encodeURIComponent(task.projectTitle)}&task=${encodeURIComponent(
      task.title
    )}`;
  });
  taskDiv.appendChild(detailsButton);

  return taskDiv;
}
