import { createButton } from "../components/buttonComponent.js";

function navigateToProyekPage() {
  window.electronAPI.navigateToProyekPage();
}

// ===== BUTTON: NAVIGATE TO PROYEK PAGE =====
const proyekButtonContainer = document.getElementById("navigate-to-proyekpage-button");
const backButton = createButton("Back to Proyek Page", navigateToProyekPage, "large");

proyekButtonContainer.appendChild(backButton);
