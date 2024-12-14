export async function loadProjects(renderProjects) {
  try {
    const projects = await window.electronAPI.project.getAll();
    renderProjects(projects); // Panggil fungsi render
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

export async function addProject(newProject, loadProjectsCallback) {
  try {
    const result = await window.electronAPI.project.add(newProject);
    if (result.success) {
      alert('Project added successfully!');
      if (loadProjectsCallback) loadProjectsCallback();
    } else {
      alert(`Failed to add project: ${result.error}`);
    }
  } catch (error) {
    console.error('Error adding project:', error);
  }
}

export async function deleteProject(projectId, loadProjectsCallback) {
  try {
    const result = await window.electronAPI.project.delete(projectId);
    if (result.success) {
      alert('Project deleted successfully!');
      if (loadProjectsCallback) loadProjectsCallback();
    } else {
      alert(`Failed to delete project: ${result.error}`);
    }
  } catch (error) {
    console.error('Error deleting project:', error);
  }
}

export async function editProject(projectId, loadProjectsCallback) {
  try {
    const projects = await window.electronAPI.project.getAll();
    const project = projects.find((proj) => proj.id === projectId);

    if (!project) {
      alert('Project not found!');
      return;
    }

    // Populate form dengan data proyek yang sudah ada
    const form = document.getElementById('add-project-form');
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-description').value = project.description;

    form.onsubmit = async (event) => {
      event.preventDefault();
      project.title = document.getElementById('project-title').value.trim();
      project.description = document.getElementById('project-description').value.trim();

      const result = await window.electronAPI.project.add(project);
      if (result.success) {
        alert('Project updated successfully!');
        if (loadProjectsCallback) loadProjectsCallback();
        form.reset();
        form.onsubmit = originalAddHandler;
      } else {
        alert(`Failed to update project: ${result.error}`);
      }
    };

    const originalAddHandler = form.onsubmit; // Backup handler default
  } catch (error) {
    console.error('Error editing project:', error);
  }
}