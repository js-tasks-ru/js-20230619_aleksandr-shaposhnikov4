export default class DoubleSlider {
  constructor(request = { min: 0, max: 100, formatValue: (value => value), selected: {} }) {
    this.min = request.min;
    this.max = request.max;
    this._formatValue = request.formatValue;
    this._selected = {};
    this._selected.from = request?.selected?.from ?? this.min;
    this._selected.to = request?.selected?.to ?? this.max;
    this.onThumbPointerMove = this.onThumbPointerMove.bind(this);
    this.onThumbPointerUp = this.onThumbPointerUp.bind(this);
    this.render();
  }
  
  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.getTemplate();        
    this.fillElements();
    this.addEventListener();
    this.update();
    document.body.append(this.element);
  }
  
  fillElements() {
    this.elements = {};
    for (const element of this.element.querySelectorAll("[data-element]")) {
      this.elements[element.dataset.element] = element;
    }
  }
  
  getTemplate() {
    return `
          <div class="range-slider">
            <span data-element="from"></span>
            <div class="range-slider__inner" data-element="inner">
              <span class="range-slider__progress" data-element="progress"></span>
              <span class="range-slider__thumb-left" data-element="thumbLeft"></span>
              <span class="range-slider__thumb-right" data-element="thumbRight"></span>
            </div>
            <span data-element="to"></span>
          </div>`;
  }
  
  addEventListener() {
    this.elements.thumbLeft.addEventListener("pointerdown", e=>this.onThumbPointerDown(e));
    this.elements.thumbRight.addEventListener("pointerdown", e=>this.onThumbPointerDown(e));
  }
  
  update() {
    const left = this.calcSide('left');
    const right = this.calcSide('right');
    
    this.elements.from.innerHTML = this._formatValue(this._selected.from);
    this.elements.to.innerHTML = this._formatValue(this._selected.to);

    this.elements.progress.style.left = left;
    this.elements.progress.style.right = right;
    this.elements.thumbLeft.style.left = left;
    this.elements.thumbRight.style.right = right;
  }
  
  calcSide(sideType) {
    const num = sideType === 'left'
      ? this._selected.from - this.min
      : this.max - this._selected.to;

    return Math.floor(this.percentWithCheck(num, this.max - this.min)) + "%";
  }

  getPosition(e) {
    switch (e.target) {
    case this.elements.thumbLeft:
      return e.target.getBoundingClientRect().right - e.clientX;
    case this.elements.thumbRight:
      return e.target.getBoundingClientRect().left - e.clientX;
    default: throw new Error("Invalid thumb type");
    }
  }
  
  calculatePercent(value, limit) {
    if (!value) {
      return 0;
    }

    const normalizeValue = Math.max(0, value / limit);
    const percentage = Math.min(normalizeValue * 100, 100);
     
    return percentage;
  }

  percentWithCheck(min, max, otherValue) {
    const percentage = this.calculatePercent(min, max);
    const result = percentage + otherValue > 100 ? 100 - otherValue : percentage;

    return result;
  }

  percentage = (value, otherValue) => this.percentWithCheck(value, this.elements.inner.offsetWidth, otherValue);

  onThumbPointerMove(e) {
    switch (this.dragging) {
    case this.elements.thumbLeft:
      this.leftThumbMove(e);
      break;
    case this.elements.thumbRight:
      this.rightThumbMove(e);
      break;
    default:
      throw new Error("Invalid thumb type");
    }

    this.update();
    const values = {from: this._selected.from, to: this._selected.to};
    this.element.dispatchEvent(new CustomEvent("range-select", { detail: values }));
  }

  leftThumbMove(e) {
    const innerElement = this.element.querySelector('.range-slider__inner');
    const innerRect = innerElement.getBoundingClientRect();
    const value = +Math.floor((this.max - this.min) * (e.clientX - innerRect.left) / innerRect.width).toFixed(0);

    this._selected.from = Math.max(this.min, Math.min(this.min + value, this._selected.to));
  }
  
  rightThumbMove(e) {
    const innerElement = this.element.querySelector('.range-slider__inner');
    const innerRect = innerElement.getBoundingClientRect();
    let value = +Math.floor((this.max - this.min) * (innerRect.right - e.clientX) / innerRect.width).toFixed(0);

    this._selected.to = Math.min(this.max, Math.max(this.max - value, this._selected.from));
  }

  onThumbPointerDown(e) {
    this.currentPosition = this.getPosition(e);
    this.dragging = e.target;
    this.element.classList.add("range-slider_dragging");
    document.addEventListener("pointermove", this.onThumbPointerMove);
    document.addEventListener("pointerup", this.onThumbPointerUp);
  }

  onThumbPointerUp() {
    this.element.classList.remove("range-slider_dragging");
    document.removeEventListener("pointermove", this.onThumbPointerMove);
    document.removeEventListener("pointerup", this.onThumbPointerUp);
  }
  
  remove() {
    if (this.elementent) {
      this.elementent.remove();
    }
  }
  
  destroy() {
    this.remove();
    this.element = null;
  
    document.removeEventListener("pointermove", this.onThumbPointerMove);
    document.removeEventListener("pointerup", this.onThumbPointerUp);
  }    
}