import { createButton } from "../components/buttonComponent.js";

let currentPage = 1;
const itemsPerPage = 6;
let totalPages = 1;

function navigateToProyekPage(projectId) {
  window.location.href = `proyekpage.html?id=${projectId}`;
}

async function renderProjects(page = 1) {
  const data = await window.electronAPI.getProjectData();
  const container = document.getElementById("project-container");
  container.innerHTML = ''; // Clear previous content

  // Calculate total pages
  totalPages = Math.ceil(data.projects.length / itemsPerPage);

  // Get projects for the current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const projectsToDisplay = data.projects.slice(startIndex, endIndex);

  let row;
  for (const [index, project] of projectsToDisplay.entries()) {
    if (index % 3 === 0) {
      row = document.createElement("div");
      row.className = "project-row";
      container.appendChild(row);
    }

    const projectDiv = document.createElement("div");
    projectDiv.className = "project-container";

    // Project Title
    const title = document.createElement("h1");
    title.textContent = project.title;
    title.className = "project-title";

    // Calculate progress percentage
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((task) => task.complete === 2).length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Update project endDate and endTime if all tasks are complete
    if (Math.round(progressPercentage) === 100 && !project.endDate) {
      const now = new Date();
      project.endDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
      project.endTime = now.toTimeString().split(" ")[0]; // HH:MM:SS

      // Update the project data in the backend
      const updateResponse = await window.electronAPI.updateProjectEndDate(project.id, project.endDate, project.endTime);
      if (!updateResponse.success) {
        console.error("Failed to update project's endDate and endTime.");
      }
    }

    // Date Capsule (Start Date - End Date)
    const dateCapsule = document.createElement("div");
    dateCapsule.className = "date-capsule";
    dateCapsule.textContent = `${project.startDate} - ${project.endDate ? project.endDate : "Ongoing"}`;

    // Description with 30 characters limit
    const description = document.createElement("p");
    let truncatedDescription = project.description;
    if (truncatedDescription.length > 30) {
      truncatedDescription = truncatedDescription.substring(0, 30) + '...';
    }
    description.textContent = truncatedDescription;

    // Progress Bar
    const progressBarContainer = document.createElement("div");
    progressBarContainer.className = "progress-bar-container";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.style.width = `${progressPercentage}%`;

    progressBarContainer.appendChild(progressBar);

    // Progress Percentage Text
    const progressPercentageText = document.createElement("span");
    progressPercentageText.className = "progress-percentage";
    progressPercentageText.textContent = `${Math.round(progressPercentage)}%`;

    // Detail Button
    const button = createButton("Detail", () => navigateToProyekPage(project.id), "medium");

    // Container for Progress Bar and Button
    const progressButtonContainer = document.createElement("div");
    progressButtonContainer.className = "progress-button-container";

    // Add Progress Bar and Percentage to Wrapper
    const progressWrapper = document.createElement("div");
    progressWrapper.className = "progress-wrapper";
    progressWrapper.appendChild(progressBarContainer);
    progressWrapper.appendChild(progressPercentageText);

    // Arrange Progress and Button
    progressButtonContainer.appendChild(progressWrapper);
    progressButtonContainer.appendChild(button);

    // Assemble projectDiv elements
    projectDiv.appendChild(title);
    projectDiv.appendChild(dateCapsule);
    projectDiv.appendChild(description);
    projectDiv.appendChild(progressButtonContainer);

    row.appendChild(projectDiv);
  }

  // Render Pagination Controls
  renderPaginationControls(page);
}

function renderPaginationControls(currentPage) {
  let paginationContainer = document.getElementById("pagination-container");

  // If pagination container doesn't exist, create it and append below project container
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    const projectRows = document.querySelector(".project-rows");
    // Create a new row for pagination
    const paginationRow = document.createElement("div");
    paginationRow.className = "pagination-row";
    paginationRow.appendChild(paginationContainer);
    projectRows.appendChild(paginationRow);
  }

  paginationContainer.innerHTML = ''; // Clear previous controls

  if (totalPages > 1) {
    // Back Button
    const backButton = document.createElement("button");
    backButton.textContent = "Back";
    backButton.className = "pagination-button";
    backButton.disabled = currentPage <= 1;

    backButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderProjects(currentPage);
      }
    });

    paginationContainer.appendChild(backButton);

    // Next Button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.className = "pagination-button";
    nextButton.disabled = currentPage >= totalPages;

    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProjects(currentPage);
      }
    });

    paginationContainer.appendChild(nextButton);
  }
}

// Function to render notifications for tasks with deadlines less than three days away
async function renderNotifications() {
  const data = await window.electronAPI.getProjectData();
  const now = new Date();
  const notifications = [];

  for (const project of data.projects) {
    for (const task of project.tasks) {
      if (task.complete !== 2) {
        const deadline = new Date(`${task.deadlineDate}T${task.deadlineTime}`);
        const timeDiff = deadline - now;
        const daysLeft = timeDiff / (1000 * 60 * 60 * 24);

        if (daysLeft > 0 && daysLeft <= 3) {
          notifications.push({
            projectTitle: project.title,
            taskTitle: task.title,
          });
        }
      }
    }
  }

  if (notifications.length > 0) {
    showNotificationPopup(notifications);
  }
}

function showNotificationPopup(notifications) {
  let currentNotificationIndex = 0;

  function renderNotification() {
    const { projectTitle, taskTitle } = notifications[currentNotificationIndex];

    // Create notification pop-up
    const overlay = document.createElement("div");
    overlay.className = "action-popup-overlay";

    const popup = document.createElement("div");
    popup.className = "action-popup";

    const closeButton = document.createElement("span");
    closeButton.className = "close-button";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => {
      document.body.removeChild(overlay);
    };

    const header = document.createElement("h1");
    header.textContent = "Deadline Tugas Mendekat";

    const message = document.createElement("p");
    message.textContent = `Jangan lupa mengerjakan ${taskTitle} di ${projectTitle}`;

    popup.appendChild(closeButton);
    popup.appendChild(header);
    popup.appendChild(message);

    if (currentNotificationIndex < notifications.length - 1) {
      const nextButton = createButton("Next Notification", () => {
        currentNotificationIndex++;
        document.body.removeChild(overlay);
        renderNotification();
      }, "medium");
      popup.appendChild(nextButton);
    } else {
      const okButton = createButton("Okay", () => {
        document.body.removeChild(overlay);
      }, "medium");
      popup.appendChild(okButton);
    }

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }

  renderNotification();
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects(currentPage);
  renderNotifications();
});