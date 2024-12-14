import { createButton } from "../components/Button.js";

function navigateToProyekPage() {
  window.electronAPI.navigateToProyekPage();
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

    const startTime = document.createElement("p");
    startTime.textContent = `Start Time: ${project.startTime}`;

    const endTime = document.createElement("p");
    endTime.textContent = `End Time: ${project.endTime || 'Ongoing'}`;

    const description = document.createElement("p");
    description.textContent = project.description;

    projectContentDiv.appendChild(title);
    projectContentDiv.appendChild(startTime);
    projectContentDiv.appendChild(endTime);
    projectContentDiv.appendChild(description);

    const button = createButton("Go to Proyek Page", navigateToProyekPage, "medium");

    projectDiv.appendChild(projectContentDiv);
    projectDiv.appendChild(button);

    row.appendChild(projectDiv);
  });
}

renderProjects();