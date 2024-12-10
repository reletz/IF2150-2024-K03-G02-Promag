// tugaspage.js

import { createButton } from "./components/Button.js";

function navigateToMainPage() {
  window.electronAPI.navigateToMainPage();
}

// ===== NAVIGATE TO MAIN BUTTON =====
const buttonContainer = document.getElementById("back-to-main-button");
const backButton = createButton("Go to Main Page");

backButton.addEventListener("click", () => {
  navigateToMainPage();
});

buttonContainer.appendChild(backButton);
