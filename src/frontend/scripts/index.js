import { createButton } from "../components/buttonComponent.js";

const projectsPerPage = 6;
let currentPage = 1;

function navigateToProyekPage(projectId) {
  window.location.href = `proyekpage.html?id=${projectId}`;
}

async function renderProjects() {
  const container = document.getElementById("project-container");
  container.innerHTML = "<p>Loading projects...</p>"; // Loading indicator

  try {
    const data = await window.electronAPI.getProjectData();
    console.log("Loaded project data:", data); // Log data yang diterima

    const totalProjects = data.projects.length;

    container.innerHTML = ""; // Hapus loading indicator setelah data dimuat

    if (totalProjects === 0) {
      const noProjectsMsg = document.createElement("p");
      noProjectsMsg.textContent = "No projects available.";
      container.appendChild(noProjectsMsg);
      return;
    }

    // Rendering projects
    const totalPages = Math.ceil(totalProjects / projectsPerPage);

    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const currentProjects = data.projects.slice(startIndex, endIndex);

    let row;
    currentProjects.forEach((project, index) => {
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

      const description = document.createElement("p");
      description.textContent = project.description;

      projectContentDiv.appendChild(title);
      projectContentDiv.appendChild(description);

      const button = createButton("Details", () => navigateToProyekPage(project.id), "medium");

      projectDiv.appendChild(projectContentDiv);
      projectDiv.appendChild(button);

      row.appendChild(projectDiv);
    });

    // Tambahkan tombol pagination
    renderPagination(container, totalPages);
  } catch (error) {
    console.error("Error loading projects:", error); // Log error untuk debugging
    container.innerHTML = "<p>Failed to load projects. Please try again.</p>";
  }
}

function renderPagination(container, totalPages) {
  const paginationDiv = document.createElement("div");
  paginationDiv.className = "pagination";

  // Tombol Previous
  const prevButton = createButton("Previous", () => {
    if (currentPage > 1) {
      currentPage--;
      renderProjects(); // Render ulang proyek saat pindah halaman
    }
  }, "small");
  prevButton.disabled = currentPage === 1; // Disable jika di halaman pertama
  paginationDiv.appendChild(prevButton);

  // Informasi Halaman Saat Ini
  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationDiv.appendChild(pageInfo);

  // Tombol Next
  const nextButton = createButton("Next", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProjects(); // Render ulang proyek saat pindah halaman
    }
  }, "small");
  nextButton.disabled = currentPage === totalPages; // Disable jika di halaman terakhir
  paginationDiv.appendChild(nextButton);

  // Tambahkan Pagination ke Container
  container.appendChild(paginationDiv);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
});