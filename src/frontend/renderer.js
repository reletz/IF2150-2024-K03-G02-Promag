// renderer.js

import { createButton } from "./components/Button.js";

function navigateToTugasPage() {
  window.electronAPI.navigateToTugasPage();
}

// ===== NAVIGATE TO TUGAS PAGE BUTTON =====
const buttonContainer = document.getElementById("go-to-tugaspage-button");
const navigateButton = createButton("Go to Tugas Page");

navigateButton.addEventListener("click", () => {
  navigateToTugasPage();
});

buttonContainer.appendChild(navigateButton);
