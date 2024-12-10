// components/Button.js

export function createButton(text) {
    const button = document.createElement('button');
    button.className = 'custom-button';
    button.textContent = text;
    return button;
  }