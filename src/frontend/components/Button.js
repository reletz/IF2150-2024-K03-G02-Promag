/**
 * Creates a styled button with specified text, click handler, and optional size.
 *
 * @param {string} text - The text to display on the button.
 * @param {Function} [onClick] - The function to execute on button click.
 * @param {string} [size] - The size of the button ('small', 'medium', 'large').
 * @returns {HTMLButtonElement} - The configured button element.
 */
export function createButton(text, onClick, size = "medium") {
  const button = document.createElement("button");
  button.className = `custom-button ${size}`.trim();
  button.textContent = text;
  if (onClick && typeof onClick === "function") {
    button.addEventListener("click", onClick);
  }
  return button;
}