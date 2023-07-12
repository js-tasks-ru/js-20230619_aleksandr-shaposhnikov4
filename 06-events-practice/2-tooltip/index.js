class Tooltip {
  static #instance;
  
  constructor() {
    if (Tooltip.#instance) {
      return Tooltip.#instance;
    }

    Tooltip.#instance = this;
  }

  initialize () {
    this.setEventListener();
  }

  render(html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;
    document.body.append(this.element);
  }

  setEventListener() {
    document.addEventListener('pointerover', this.onPointOver);
    document.addEventListener('pointerout', this.onPointOut);
  }

  onPointOver = event => {
    const element = event.target.closest('[data-tooltip]');
    
    if (element) {
      this.render(element.dataset.tooltip);
      document.addEventListener('pointermove', this.onPointMove);
    }
  }

  onPointMove = event => {
    this.moveTooltip(event);
  }

  onPointOut = event => {
    this.remove();
    document.removeEventListener('pointermove', this.onPointMove);
  }

  moveTooltip(event) {
    const shift = 10;
    const left = event.clientX + shift;
    const top = event.clientY + shift;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointOver);
    document.removeEventListener('pointerout', this.onPointOut);
    document.removeEventListener('pointermove', this.onPointMove);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;