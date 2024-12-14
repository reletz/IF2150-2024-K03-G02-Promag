// src/frontend/scripts/index.js

import { createButton } from "../components/buttonComponent.js";

function navigateToProyekPage(projectId) {
  window.location.href = `proyekpage.html?id=${projectId}`;
}

async function renderProjects() {
  const data = await window.electronAPI.getProjectData();

  const container = document.getElementById("project-container");
  let row;
  data.projects.forEach((project, index) => {
    if (index % 3 === 0) {
      row = document.createElement("div");
      row.className = "project-row";
      container.appendChild(row);
    }

    const projectDiv = document.createElement("div");
    projectDiv.className = "project-container";

    const projectContentDiv = document.createElement("div");
    projectContentDiv.className = "project-content";

    const title = document.createElement("h1");
    title.textContent = project.title;

    const startDate = document.createElement("p");
    startDate.textContent = `Start Date: ${project.startDate}`;

    const startTime = document.createElement("p");
    startTime.textContent = `Start Time: ${project.startTime}`;

    const endDate = document.createElement("p");
    endDate.textContent = `End Date: ${project.endDate || "Ongoing"}`;

    const endTime = document.createElement("p");
    endTime.textContent = `End Time: ${project.endTime || ""}`;

    const description = document.createElement("p");
    description.textContent = project.description;

    projectContentDiv.appendChild(title);
    projectContentDiv.appendChild(startDate);
    projectContentDiv.appendChild(startTime);
    projectContentDiv.appendChild(endDate);
    projectContentDiv.appendChild(endTime);
    projectContentDiv.appendChild(description);

    // Pass the project.id using an arrow function to preserve the current project's ID
    const button = createButton("Details", () => navigateToProyekPage(project.id), "medium");

    projectDiv.appendChild(projectContentDiv);
    projectDiv.appendChild(button);

    row.appendChild(projectDiv);
  });
}

renderProjects();
