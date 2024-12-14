// src/frontend/components/buttonComponent.js

/**
 * Creates a styled button.
 * @param {string} text - The button text.
 * @param {Function} onClick - The click event handler.
 * @param {string} size - The size variant (e.g., 'small', 'medium', 'large').
 * @returns {HTMLButtonElement} - The created button element.
 */
export function createButton(text, onClick, size = "medium") {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add("custom-button", size);
  button.addEventListener("click", onClick);
  return button;
}

export function createLightButton(text, onClick, size = "medium") {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add("custom-light-button", size);
  button.addEventListener("click", onClick);
  return button;
}

export function createDeleteButton(text, onClick, size = "medium") {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add("custom-delete-button", size);
  button.addEventListener("click", onClick);
  return button;
}

/**
 * Creates a styled dropdown select element.
 * @param {string} id - The dropdown ID.
 * @param {Array<string>} options - The dropdown options.
 * @param {string} selected - The initially selected option.
 * @returns {HTMLSelectElement} - The created dropdown element.
 */
export function createDropdown(id, options, selected) {
  const select = document.createElement("select");
  select.id = id;

  options.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText.toLowerCase();
    option.textContent = optionText;
    if (optionText.toLowerCase() === selected.toLowerCase()) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  return select;
}
