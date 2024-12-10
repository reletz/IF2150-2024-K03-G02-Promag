// components/Button.js

/**
 * Creates a styled button with specified text and click handler.
 *
 * @param {string} text - The text to display on the button.
 * @param {Function} onClick - The function to execute on button click.
 * @returns {HTMLButtonElement} - The configured button element.
 */
export function createButton(text, onClick) {
  const button = document.createElement("button");
  button.className = "custom-button";
  button.textContent = text;
  if (onClick) {
    button.addEventListener("click", onClick);
  }
  return button;
}
