// components/fileDialog.js

import { ipcRenderer } from "electron";

/**
 * Opens a file dialog and returns the selected file path.
 * @returns {Promise<string|null>} The selected file path or null if canceled.
 */
export function openFileDialog() {
  return ipcRenderer
    .invoke("dialog:openFile")
    .then((result) => {
      if (result.canceled) {
        return null;
      }
      return result.filePaths[0];
    })
    .catch((error) => {
      console.error("Error opening file dialog:", error);
      return null;
    });
}
