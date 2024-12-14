import { createButton } from "../components/buttonComponent.js";

function navigateToProyekPage(projectId) {
  window.location.href = `proyekpage.html?id=${projectId}`;
}

async function renderProjects() {
  const data = await window.electronAPI.getProjectData();

  const container = document.getElementById("project-container");
  container.innerHTML = ''; // Bersihkan konten sebelumnya
  let row;
  data.projects.forEach((project, index) => {
    if (index % 3 === 0) {
      row = document.createElement("div");
      row.className = "project-row";
      container.appendChild(row);
    }

    const projectDiv = document.createElement("div");
    projectDiv.className = "project-container";

    // Judul Proyek
    const title = document.createElement("h1");
    title.textContent = project.title;
    title.className = "project-title";

    // Date Capsule (Start Date - End Date)
    const dateCapsule = document.createElement("div");
    dateCapsule.className = "date-capsule";
    dateCapsule.textContent = `${project.startDate} - ${project.endDate ? project.endDate : "Ongoing"}`;

    // Deskripsi dengan pembatasan 30 karakter
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

    // Hitung persentase progress
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.complete).length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    progressBar.style.width = `${progressPercentage}%`;

    progressBarContainer.appendChild(progressBar);

    // Persentase Progress
    const progressPercentageText = document.createElement("span");
    progressPercentageText.className = "progress-percentage";
    progressPercentageText.textContent = `${Math.round(progressPercentage)}%`;

    // Tombol Detail
    const button = createButton("Detail", () => navigateToProyekPage(project.id), "medium");

    // Container untuk Progress Bar dan Button
    const progressButtonContainer = document.createElement("div");
    progressButtonContainer.className = "progress-button-container";

    // Tambahkan Progress Bar dan Persentase ke dalam Wrapper
    const progressWrapper = document.createElement("div");
    progressWrapper.className = "progress-wrapper";
    progressWrapper.appendChild(progressBarContainer);
    progressWrapper.appendChild(progressPercentageText);

    // Susun Progress dan Button
    progressButtonContainer.appendChild(progressWrapper);
    progressButtonContainer.appendChild(button);

    // Susun elemen ke dalam projectDiv
    projectDiv.appendChild(title);
    projectDiv.appendChild(dateCapsule);
    projectDiv.appendChild(description);
    projectDiv.appendChild(progressButtonContainer);

    row.appendChild(projectDiv);
  });
}

renderProjects();