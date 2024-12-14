// Menunggu sampai DOM siap
document.addEventListener("DOMContentLoaded", () => {
    // Menangani form create project
    const createProjectForm = document.getElementById("create-project-form");
  
    // Membuat elemen form untuk title, description, dan deadline
    const formElement = document.createElement("form");
  
    // Title input
    const titleLabel = document.createElement("label");
    titleLabel.setAttribute("for", "title");
    titleLabel.textContent = "Project Title:";
    const titleInput = document.createElement("input");
    titleInput.setAttribute("type", "text");
    titleInput.setAttribute("id", "title");
    titleInput.setAttribute("name", "title");
    titleInput.setAttribute("required", true);
    formElement.appendChild(titleLabel);
    formElement.appendChild(titleInput);
  
    // Description input
    const descriptionLabel = document.createElement("label");
    descriptionLabel.setAttribute("for", "description");
    descriptionLabel.textContent = "Description:";
    const descriptionInput = document.createElement("textarea");
    descriptionInput.setAttribute("id", "description");
    descriptionInput.setAttribute("name", "description");
    descriptionInput.setAttribute("required", true);
    formElement.appendChild(descriptionLabel);
    formElement.appendChild(descriptionInput);
  
    // Deadline input (calendar)
    const deadlineLabel = document.createElement("label");
    deadlineLabel.setAttribute("for", "deadline");
    deadlineLabel.textContent = "Deadline:";
    const deadlineInput = document.createElement("input");
    deadlineInput.setAttribute("type", "date");
    deadlineInput.setAttribute("id", "deadline");
    deadlineInput.setAttribute("name", "deadline");
    deadlineInput.setAttribute("required", true);
    formElement.appendChild(deadlineLabel);
    formElement.appendChild(deadlineInput);
  
    // Submit button
    const submitButton = document.createElement("button");
    submitButton.setAttribute("type", "submit");
    submitButton.textContent = "Create Project";
    formElement.appendChild(submitButton);
  
    // Menambahkan form ke dalam section create project
    createProjectForm.appendChild(formElement);
  });
  