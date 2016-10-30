'use babel';

export default class WordcountTestView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('wordcount-test');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The WordcountTest package is Alive! It\'s ALIVE! woah';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  setCount(count) {
    this.element.children[0].textContent =  `There are ${count} words`
  }
}
