// src/frontend/components/fileDialog.js

/**
 * Opens a file dialog and returns the selected file path.
 * @returns {Promise<Object>} The dialog result containing file paths.
 */
export function openFileDialog() {
  return window.electronAPI.openFileDialog();
}
