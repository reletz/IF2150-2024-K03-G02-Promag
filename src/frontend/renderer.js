import { createButton } from './components/Button.js';

const buttonContainer = document.getElementById('button-1');
const button = createButton('Click Me');

button.addEventListener('click', () => {
  console.log('Button clicked!');
});

buttonContainer.appendChild(button);