// Select the section for the new task form
const formSection = document.querySelector('#new-task-form');

// Create the form element
const form = document.createElement('form');
form.id = 'task-form';

// Create the title input field
const titleLabel = document.createElement('label');
titleLabel.htmlFor = 'task-title';
titleLabel.textContent = 'Title';

const titleInput = document.createElement('input');
titleInput.type = 'text';
titleInput.id = 'task-title';
titleInput.name = 'title';
titleInput.placeholder = 'Enter task title';
titleInput.required = true;

// Create the description input field
const descriptionLabel = document.createElement('label');
descriptionLabel.htmlFor = 'task-description';
descriptionLabel.textContent = 'Description';

const descriptionInput = document.createElement('textarea');
descriptionInput.id = 'task-description';
descriptionInput.name = 'description';
descriptionInput.placeholder = 'Enter task description';
descriptionInput.rows = 5;
descriptionInput.required = true;

// Create the priority dropdown
const priorityLabel = document.createElement('label');
priorityLabel.htmlFor = 'task-priority';
priorityLabel.textContent = 'Priority';

const prioritySelect = document.createElement('select');
prioritySelect.id = 'task-priority';
prioritySelect.name = 'priority';

const priorities = ['High', 'Medium', 'Low'];
priorities.forEach((priority) => {
  const option = document.createElement('option');
  option.value = priority.toLowerCase();
  option.textContent = priority;
  prioritySelect.appendChild(option);
});

// Create the deadline input field
const deadlineLabel = document.createElement('label');
deadlineLabel.htmlFor = 'task-deadline';
deadlineLabel.textContent = 'Deadline';

const deadlineInput = document.createElement('input');
deadlineInput.type = 'date';
deadlineInput.id = 'task-deadline';
deadlineInput.name = 'deadline';
deadlineInput.required = true;

// Add the form elements to the form
form.appendChild(titleLabel);
form.appendChild(titleInput);
form.appendChild(descriptionLabel);
form.appendChild(descriptionInput);
form.appendChild(priorityLabel);
form.appendChild(prioritySelect);
form.appendChild(deadlineLabel);
form.appendChild(deadlineInput);

// Add the form to the form section
formSection.appendChild(form);

// Select the footer section
const footerSection = document.querySelector('#footer');

// Create the submit button
const createButton = document.createElement('button');
createButton.type = 'submit';
createButton.id = 'create-task-button';
createButton.textContent = 'Create Task';

// Add the button to the form and footer
form.appendChild(createButton);
footerSection.appendChild(createButton);
