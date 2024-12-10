import { createButton } from "../components/Button.js";

function navigateToProyekPage() {
  window.electronAPI.navigateToProyekPage();
}

// ===== BUTTON: NAVIGATE TO PROYEK PAGE =====
const mainButtonContainer = document.getElementById("navigate-to-proyekpage-button");
const backButton = createButton("Back to Proyek Page", navigateToProyekPage, "large");

mainButtonContainer.appendChild(backButton);
