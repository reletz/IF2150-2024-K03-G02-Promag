import { createButton } from "../components/Button.js";

function navigateToMainPage() {
  window.electronAPI.navigateToMainPage();
}

// ===== BUTTON: NAVIGATE TO MAIN PAGE =====
const mainButtonContainer = document.getElementById("navigate-to-main-button");
const backButton = createButton("Back to Main Page", navigateToMainPage, "large");

mainButtonContainer.appendChild(backButton);

function navigateToTugasPage() {
  window.electronAPI.navigateToTugasPage();
}

// ===== BUTTON: NAVIGATE TO TUGAS PAGE =====
const tugasButtonContainer = document.getElementById("navigate-to-tugaspage-button");
const navigateButton = createButton("Go to Tugas Page", navigateToTugasPage, "large");

tugasButtonContainer.appendChild(navigateButton);
